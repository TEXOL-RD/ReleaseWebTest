package bleconfig

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var connectLostHandler mqtt.ConnectionLostHandler = func(client mqtt.Client, err error) {
	log.Printf("Connect lost: %s, message: %v", getClientID(client), err)
}

// Message: Pub, Sub, Close
type eventPro struct {
	Message string
	Value   interface{}
}

type publishPro struct {
	Topic   string
	Payload string
}

type subscribePro struct {
	Topic string
}

type subMessage func(string, string)

type mqttConPro struct {
	ClientID          string
	IP                string
	Port              string
	Username          string
	Password          string
	CAcertificateFile string
	messagePubHandler mqtt.MessageHandler
	connectHandler    mqtt.OnConnectHandler
}

var conChanList []chan eventPro //Connect Chan List
var conList []string

func mQTTCon(mqttConfig mqttConPro, EventChan chan eventPro, STopic []string, subMessage subMessage) {

	mqttConfig.messagePubHandler = func(client mqtt.Client, msg mqtt.Message) { //SUB
		subMessage(msg.Topic(), string(msg.Payload()))
	}

	mqttConfig.connectHandler = func(client mqtt.Client) {
		log.Printf("MQTT Connected: %s\n", getClientID(client))
		for _, Topic := range STopic {
			SubString := subscribePro{Topic}
			go subscribe(client, SubString)
		}
	}

	client := connect(mqttConfig)
	defer func() {
		client.Disconnect(250)
		log.Printf("MQTT Close: %s\n", getClientID(client))
	}()

	for Event := range EventChan {
		//fmt.Println("Message: " + Event.Message)
		switch Event.Message {
		case `Pub`:
			Pubstring := Event.Value.(publishPro)
			log.Println("Pub: ", Pubstring)
			publish(client, Pubstring)
		case `Sub`:
			SubString := Event.Value.(subscribePro)
			go subscribe(client, SubString)
		case `Close`:
			goto Out
		}
	}
Out:
}

func connect(Config mqttConPro) mqtt.Client {
	log.Println(Config)

	opts := mqtt.NewClientOptions()

	TLS := false //CAcertificateFile
	if Config.CAcertificateFile != "" {
		TLS = true
		tlsConfig := newTlsConfig(Config.CAcertificateFile)
		opts.SetTLSConfig(tlsConfig)
	}

	opts.AddBroker(address(Config.IP, Config.Port, TLS))
	opts.SetClientID(Config.ClientID)
	opts.SetUsername(Config.Username)
	opts.SetPassword(Config.Password)
	opts.SetDefaultPublishHandler(Config.messagePubHandler)
	opts.SetOnConnectHandler(Config.connectHandler)
	opts.SetConnectionLostHandler(connectLostHandler)
	opts.SetKeepAlive(60 * time.Second) //opts.KeepAlive = 60
	opts.SetAutoReconnect(true)         //opts.AutoReconnect = true

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Println(token.Error())
		panic(token.Error())
	}
	return client
}

func publish(client mqtt.Client, Pubstring publishPro) {
	//fmt.Println("Publish: ", Pubstring.Topic)
	token := client.Publish(Pubstring.Topic, 0, false, Pubstring.Payload)
	//fmt.Println("publish")
	token.Wait()

	//time.Sleep(time.Second)
}

func subscribe(client mqtt.Client, SubString subscribePro) {
	Topic := SubString.Topic
	log.Printf("Subscribed to topic: %s\n", Topic)
	token := client.Subscribe(Topic, 1, nil)
	token.Wait()
}

func timeStamp() string {
	return time.Now().Format("2006-01-02T15:04:05.000+08:00")
}

func toJSON(J interface{}) string {
	jsonstring, err := json.Marshal(J)
	if err != nil {
		log.Println("json err:", err)
		return ""
	} else {
		return string(jsonstring)
	}
}

func getClientID(client mqtt.Client) string {
	ClientOptionsReader := client.OptionsReader()
	return ClientOptionsReader.ClientID()
}

func newTlsConfig(Filename string) *tls.Config { //TLS/SSL mode	CA certificate
	certpool := x509.NewCertPool()
	ca, err := os.ReadFile(Filename)
	if err != nil {
		log.Fatalln(err.Error())
	}
	certpool.AppendCertsFromPEM(ca)
	return &tls.Config{
		RootCAs:            certpool,
		ClientAuth:         tls.NoClientCert,
		ClientCAs:          nil,
		InsecureSkipVerify: true,
		//Certificates:       []tls.Certificate{cert},
	}
}

func address(Address string, Port string, TLS bool) string { //*MQTTConPro
	address := ""
	if TLS {
		address = fmt.Sprintf("tcps://%s:%s", Address, Port) //Enable SSL/TLS //ssl:
	} else {
		address = fmt.Sprintf("tcp://%s:%s", Address, Port)
	}
	log.Println("Address: " + address)
	return address
}

func gosub(client mqtt.Client, Topic string, Connet bool, SubEn *bool) {
	DoSub := false
	if Connet {
		DoSub = *SubEn
	} else {
		DoSub = !*SubEn
	}
	fmt.Println("go sub: ", DoSub)
	if DoSub {
		SubString := subscribePro{Topic}
		go subscribe(client, SubString)
		*SubEn = true
	}
}
