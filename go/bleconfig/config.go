package bleconfig

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"
)

const (
	brokerHost = "192.168.0.19" //192.168.0.21  //texol-broker" //core-data : for  connect Iotech
	brokerPort = "1884"         //1884 //1883
	username   = ""
	password   = ""
	clientId   = "texol-config-utility"
)

type RPMPro struct {
	RPM_S uint32
	RPM_E uint32
}

type PIBPro struct {
	Band_Order    uint8
	Start         float32
	Stop          float32
	Magnification uint8
}

type QCPro struct {
	Warning float32
	Alarm   float32
}

type Bridge_inform_config struct {
	BridgeUUID   string
	Channel      string //1R2L
	BLEUUID      string
	BLEFWVersion string
}

type Bridge_inform_Release struct {
	BridgeUUID string
	Channel    string //1R2L
	Pipe       string
}

type Uniaxial_configPro struct {
	DeviceID      string
	Sensitivity   float32
	Trigger_Level float32
	RPM           RPMPro
	PIB_Array     []PIBPro //P1~P10
	QC_Array      []QCPro  //OA.P.PtoP.CF.P1~P10
}

type Triaxial_configPro struct {
	Version          int8
	DeviceID         string
	XSensitivity     float32
	YSensitivity     float32
	ZSensitivity     float32
	Trigger_Level    float32
	Hardware_Trigger uint8   //Disable:0 Enable:1
	Delay            uint8   //v2 display
	Undefined        float32 // Not display
	Analyze          uint8   //v2 display
	RPM              RPMPro
	PIB_Array        []PIBPro //XP1~P3.YP1~P3.ZP1~P3
	QC_Array         []QCPro  //XOA.YOA.ZOA.XP1~P3.YP1~P3.ZP1~P3

}

type setting_configPro struct {
	DeviceID      string
	Sensitivity   float32
	Trigger_Level float32
	Delay         uint8
	Undefined     float32
	Analyze       uint8
	RPM           RPMPro
	PIB_Array     []PIBPro //len: 10
	QC_Array      []QCPro  //len: 14
}

var eventChan = make(chan eventPro)

var getMessage = make(chan []string)

func Start() {
	mqttPro := mqttConPro{
		ClientID:          clientId,
		IP:                brokerHost,
		Port:              brokerPort,
		Username:          username,
		Password:          password,
		CAcertificateFile: "",
	}

	var subMessage subMessage
	subMessage = func(topic string, payload string) {
		log.Printf("%s: %s\n", topic, payload)
		getMessage <- []string{topic, payload}
	}

	// Connect MQTT Broker
	go mQTTCon(mqttPro, eventChan, []string{"/SENSOR/REPLY", "/SENSOR/PIPE_STATUS"}, subMessage)

	//time.Sleep(1 * time.Second)
}

func Stop() {
	eventChan <- eventPro{
		Message: "Close",
		Value:   nil,
	}

	time.Sleep(1 * time.Second)
}

func GetIP() string {
	ip := brokerHost
	//fmt.Println(ip)
	return ip
}

// success: true/false
func Remote_Configuration(Bridge_inform Bridge_inform_config, config interface{}) (bool, error) {

	cmd, err := to_Remote_Configuration_cmd(Bridge_inform, config)
	if err != nil {
		return false, err
	}

	eventChan <- eventPro{
		Message: "Pub",
		Value: publishPro{
			Topic:   fmt.Sprintf("/UART_RX/%s", Bridge_inform.BridgeUUID),
			Payload: cmd,
		},
	}

	timeoutch := make(chan bool, 1)
	go timeout(20*time.Second, timeoutch)
	//defer close(timeoutch)

	for {
	LOOP:
		select {
		case reachable := <-getMessage:
			if reachable[0] == "/SENSOR/REPLY" {
				meg := strings.Split(reachable[1], ",")
				if meg[0] == Bridge_inform.BridgeUUID || meg[1] == Bridge_inform.Channel {
					ACK := meg[6][:1]
					return ACK == "0", nil
				}
			}
			break LOOP

		case <-timeoutch:
			return false, errors.New("Remote Configuration Timeout!")
		}
	}
}

// success: true/false ,timeout
func Release_pipe(Bridge_inform Bridge_inform_Release) (bool, error) {
	var cmds []string

	cmds = append(cmds, "55")
	cmds = append(cmds, Bridge_inform.BridgeUUID, Bridge_inform.Pipe[1:2], channel(Bridge_inform.Channel))
	cmd := strings.Join(cmds, ",")

	eventChan <- eventPro{
		Message: "Pub",
		Value: publishPro{
			Topic:   fmt.Sprintf("/UART_RX/%s", Bridge_inform.BridgeUUID),
			Payload: cmd,
		},
	}

	timeoutch := make(chan bool, 1)
	go timeout(5*time.Second, timeoutch)
	//defer close(timeoutch)

	for {
	LOOP:
		select {
		case reachable := <-getMessage:
			if reachable[0] == "/SENSOR/REPLY" {
				meg := strings.Split(reachable[1], ",")

				if meg[0] == Bridge_inform.BridgeUUID || meg[1] == channel(Bridge_inform.Channel) {
					ACK := meg[6][:1]
					return ACK == "0", nil
				}
			}
			break LOOP

		case <-timeoutch:
			return false, errors.New("Release pipe Timeout!")
		}
	}
}

// R5組+L5組
func Get_pipe(BridgeUUID string) ([10]bool, error) {
	var cmds []string

	cmds = append(cmds, "54")
	cmds = append(cmds, BridgeUUID)
	cmd := strings.Join(cmds, ",")

	eventChan <- eventPro{
		Message: "Pub",
		Value: publishPro{
			Topic:   fmt.Sprintf("/UART_RX/%s", BridgeUUID),
			Payload: cmd,
		},
	}

	timeoutch := make(chan bool, 1)
	go timeout(5*time.Second, timeoutch)
	//defer close(timeoutch)

	var pipe [10]bool
	var up [2]bool
	var c int
	for {
	LOOP:
		select {
		case reachable := <-getMessage:
			if reachable[0] == "/SENSOR/PIPE_STATUS" {
				meg := strings.Split(reachable[1], ",")
				p := pipetobools(meg[0])
				switch meg[1] {
				case "1":
					up[0] = true
					c = 0
				case "2":
					up[1] = true
					c = 5
				}
				for i, b := range p {
					pipe[i+c] = b
				}
			}
			if up[0] && up[1] {
				return pipe, nil
			}
			break LOOP

		case <-timeoutch:
			return pipe, errors.New("Release pipe Timeout!")
		}
	}
}

func to_Remote_Configuration_cmd(Bridge_inform Bridge_inform_config, config interface{}) (string, error) {
	var cmd string
	var cmds []string

	cmds = append(cmds, Bridge_inform.BLEUUID, Bridge_inform.BridgeUUID)

	byt, err := config_to_bytArray(Bridge_inform.BLEFWVersion, config)
	if err != nil {
		return "", err
	}
	for _, X := range byt {
		cmds = append(cmds, fmt.Sprintf("%02X", X))
	}

	cmds = append(cmds, channel(Bridge_inform.Channel))

	cmd = strings.Join(cmds, ",")

	return cmd, nil
}

func config_to_bytArray(Version string, config interface{}) ([]byte, error) {
	var byt []byte
	var err error

	//Version check
	if len(Version) == 4 {

		var settingConfig setting_configPro
		var byt1 []byte
		switch c := config.(type) {
		case Uniaxial_configPro:
			//byt1, err = configToByte(c.DeviceID, c.Sensitivity, c.Trigger_Level, 0, 5, c.RPM, c.PIB_Array, c.QC_Array)
			settingConfig = setting_configPro{
				DeviceID:      c.DeviceID,
				Sensitivity:   c.Sensitivity,
				Trigger_Level: c.Trigger_Level,
				Delay:         0,
				Undefined:     1,
				Analyze:       5,
				RPM:           c.RPM,
				PIB_Array:     c.PIB_Array,
				QC_Array:      c.QC_Array,
			}
		case Triaxial_configPro:
			settingConfig = setting_configPro{
				DeviceID:      c.DeviceID,
				Sensitivity:   c.XSensitivity,
				Trigger_Level: c.Trigger_Level,
				Delay:         c.Delay,
				Undefined:     c.Undefined,
				Analyze:       c.Analyze,
				RPM:           c.RPM,
				PIB_Array:     c.PIB_Array,
				QC_Array:      c.QC_Array,
			}
			settingConfig.PIB_Array = append(settingConfig.PIB_Array, PIBPro{
				Band_Order:    c.Hardware_Trigger,
				Start:         c.YSensitivity,
				Stop:          c.ZSensitivity,
				Magnification: 0,
			})
			settingConfig.QC_Array = append(settingConfig.QC_Array, QCPro{10, 20}, QCPro{10, 20})
			//byt1, err = configToByte(c.DeviceID, c.XSensitivity, c.Trigger_Level, c.Delay, c.Analyze, c.RPM, c.PIB_Array, c.QC_Array)

		}

		byt1, err = configToByte(settingConfig)

		if err == nil {
			byt = append(byt, byt1...)

			Version = Version[2:] + Version[:2]
			if Version >= "010B" {
				byt = byt[1:]
			} else {
				byt = byt[:len(byt)-1]
			}
		}
	} else {
		err = errors.New("BLE FW Version failed!")
	}

	return byt, err
}

/*
	func get_BLE_FW_Version(Version string) (int16, error) {
		if len(Version) == 4 {
			Version = Version[2:] + Version[:2]
			s, e := strconv.ParseInt(Version, 16, 16)
			if e == nil {
				ver := int16(s)
				return ver, nil
			}
		}
		err := errors.New("BLE FW Version failed!")

		return 0, err
	}
*/
func configToByte(config setting_configPro) ([]byte, error) {
	//DeviceID string, Sensitivity float32, Trigger_Level float32, Delay uint8, Analyze uint8, RPM RPMPro, Freqs []PIBPro, QCs []QCPro
	var buf []byte
	var output_error error

	if len(config.DeviceID) != 6 {
		output_error = errors.Join(output_error, errors.New(fmt.Sprintf("DeviceID failed! DeviceID: %s", config.DeviceID)))
	}
	if len(config.PIB_Array) != 10 {
		output_error = errors.Join(output_error, errors.New("PIB length failed!"))
	}
	if len(config.QC_Array) != 14 {
		output_error = errors.Join(output_error, errors.New("QC length failed!"))
	}

	if output_error == nil {
		var err error

		buf = append(buf, 0x5b)
		buf = append(buf, []byte(config.DeviceID)...)

		err = errors.Join(err, floatToByte(config.Sensitivity, &buf))
		err = errors.Join(err, floatToByte(config.Trigger_Level, &buf))
		err = errors.Join(err, uint8intToByte(config.Delay, &buf))
		err = errors.Join(err, floatToByte(config.Undefined, &buf))
		err = errors.Join(err, uint8intToByte(config.Analyze, &buf))
		err = errors.Join(err, uint32intToByte(config.RPM.RPM_S, &buf))
		err = errors.Join(err, uint32intToByte(config.RPM.RPM_E, &buf))

		for _, pib := range config.PIB_Array {
			err = errors.Join(err, uint8intToByte(pib.Band_Order, &buf))
			err = errors.Join(err, floatToByte(pib.Start, &buf))
			err = errors.Join(err, floatToByte(pib.Stop, &buf))
			err = errors.Join(err, uint8intToByte(pib.Magnification, &buf))
		}

		for _, qc := range config.QC_Array {
			err = errors.Join(err, floatToByte(qc.Warning, &buf))
			err = errors.Join(err, floatToByte(qc.Alarm, &buf))
		}

		buf = append(buf, crc(buf))

		if err != nil {
			output_error = errors.Join(output_error, errors.New("Configuration failed!"))
		}
	}

	return buf, output_error
}

func channel(Channel string) string {
	switch Channel {
	case "R":
		return "1"
	case "L":
		return "2"
	}
	return "0"
}

func floatToByte(f float32, byt *[]byte) error {
	var buf bytes.Buffer
	err := binary.Write(&buf, binary.LittleEndian, f)
	if err != nil {
		return err
	}

	*byt = append(*byt, buf.Bytes()...)

	return nil
}

func uint8intToByte(u8 uint8, byt *[]byte) error {
	var buf bytes.Buffer
	err := binary.Write(&buf, binary.BigEndian, u8)
	if err != nil {
		return err
	}

	*byt = append(*byt, buf.Bytes()...)

	return nil
}

func uint32intToByte(u32 uint32, byt *[]byte) error {
	var buf bytes.Buffer
	err := binary.Write(&buf, binary.BigEndian, u32)
	if err != nil {
		return err
	}

	*byt = append(*byt, reverseBytes(buf.Bytes())...)

	return nil
}

func reverseBytes(input []byte) []byte {
	if len(input) == 0 {
		return input
	}
	return append(reverseBytes(input[1:]), input[0])
}

func pipetobools(pipe string) [5]bool {
	var o [5]bool
	p, _ := strconv.ParseInt(pipe, 10, 8)
	for i := 0; i < len(o); i++ {
		r := p % 2
		o[i] = r == 1
		p = p / 2
	}

	return o
}

func Uniaxial_config_default() Uniaxial_configPro {
	config := Uniaxial_configPro{
		DeviceID:      "000001",
		Sensitivity:   20.2,
		Trigger_Level: 0.001,
		RPM:           RPMPro{RPM_S: 27000, RPM_E: 33000},
	}

	//Order
	orders := []float32{1, 2, 4, 6, 8}
	for _, order := range orders {
		config.PIB_Array = append(config.PIB_Array, PIBPro{
			Band_Order:    0,
			Start:         order,
			Stop:          0.5,
			Magnification: 1,
		})
	}

	//Band
	for index := 0; index < 5; index++ {
		freq := float32((index + 5) * 1000)
		config.PIB_Array = append(config.PIB_Array, PIBPro{
			Band_Order:    1,
			Start:         freq - 100,
			Stop:          freq + 100,
			Magnification: 1,
		})
	}

	for index := 0; index < 14; index++ {
		config.QC_Array = append(config.QC_Array, QCPro{
			Warning: 3,
			Alarm:   5,
		})
	}

	return config
}

func Triaxial_config_default(DeviceID string) (Triaxial_configPro, error) {
	var config Triaxial_configPro
	var err error

	if len(DeviceID) == 6 {

		config = Triaxial_configPro{
			Version:          1,
			DeviceID:         DeviceID,
			XSensitivity:     0.488,
			YSensitivity:     0.488,
			ZSensitivity:     0.488,
			Trigger_Level:    0.001,
			Hardware_Trigger: 0,
			Delay:            1,
			Undefined:        0.3,
			Analyze:          5,
			RPM:              RPMPro{RPM_S: 3000, RPM_E: 4000},
			PIB_Array:        []PIBPro{},
			QC_Array:         []QCPro{},
		}

		if DeviceID >= "01008K" {
			config.Version = 2
			config.Delay = 0
			config.Undefined = 0
			config.Analyze = 5
		}

		//X.Y.Z
		for axis := 0; axis < 3; axis++ {
			//Order
			for Order := 0; Order < 2; Order++ {
				config.PIB_Array = append(config.PIB_Array, PIBPro{
					Band_Order:    0,
					Start:         float32(Order + 1),
					Stop:          0.5,
					Magnification: 1,
				})
			}

			//Band
			config.PIB_Array = append(config.PIB_Array, PIBPro{
				Band_Order:    1,
				Start:         5,
				Stop:          5100,
				Magnification: 1,
			})

			//QC OA
			config.QC_Array = append(config.QC_Array, QCPro{
				Warning: 2.8,
				Alarm:   4.5,
			})

			for index := 0; index < 3; index++ {
				config.QC_Array = append(config.QC_Array, QCPro{
					Warning: 10,
					Alarm:   20,
				})
			}
		}
	} else {
		err = errors.New("DeviceID length failed!")
	}

	return config, err
}

// timeout 30s
func timeout(d time.Duration, ch chan bool) {
	time.Sleep(d)
	ch <- true
}
