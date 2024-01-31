// 231225
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"runtime"

	"modtest/bleconfig"

	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type FileContent211 struct {
	DeviceID      string  `json:"DeviceID"`
	Sensitivity   float32 `json:"Sensitivity"`
	TriggerLevel  float32 `json:"Trigger_Level"`
	RPM           RPM     `json:"RPM"`
	PIB_Array      []PIB   `json:"PIB_Array"`
	QC_Array       []QC    `json:"QC_Array"`
}

type RPM struct {
	RPM_S uint32 `json:"RPM_S"`
	RPM_E uint32 `json:"RPM_E"`
}

type PIB struct {
	BandOrder     uint8     `json:"Band_Order"`
	Start         float32     `json:"Start"`
	Stop          float32 `json:"Stop"`
	Magnification uint8     `json:"Magnification"`
}

type QC struct {
	Warning float32 `json:"Warning"`
	Alarm   float32 `json:"Alarm"`
}

type RequestData struct {
	Message string `json:"message"`
}

/*
	type ResponseData struct {
		Result string `json:"result"`
	}
*/
type ResponseData struct {
	Result interface{} `json:"result"`
}

func main() {
	
	//mqtt setting
	bleconfig.Start()
	
	http.HandleFunc("/data1", func(w http.ResponseWriter, r *http.Request) {
		// 允许所有来源访问
		w.Header().Set("Access-Control-Allow-Origin", "*")
		data := []string{"1", "2", "3", "4", "5", "6", "7", "8", "9", "10"}

		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})
	// 静态文件服务
	
	/*
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "../html/index.html")
		
	})
*/
	r := mux.NewRouter()
	// 添加跨域支持
	headers := handlers.AllowedHeaders([]string{"Content-Type"})
	origins := handlers.AllowedOrigins([]string{"*"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	r.HandleFunc("/postEndpoint", handlePostRequest).Methods("POST")
	r.HandleFunc("/ReadConfigFile", ReadFile211).Methods("POST")
	r.HandleFunc("/GetIOTech", GetIoTech).Methods("POST")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("../html/")))
	//r.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../html/"))))

	http.Handle("/", handlers.CORS(headers, origins, methods)(r))

	http.ListenAndServe(":8080", nil)
	//done := make(chan bool)
	//<-done






	

}


// openBrowser 根据操作系统打开默认浏览器
func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "darwin":
		err = exec.Command("open", url).Start()
	case "windows":
		err = exec.Command("cmd", "/c", "start", url).Start()
	default:
		err = exec.Command("xdg-open", url).Start()
	}

	if err != nil {
		fmt.Println("无法打开浏览器:", err)
	}

}



/*
func sayHello(this js.Value, p []js.Value) interface{} {
	if len(p) > 0 {
		arg := p[0].String()
		fmt.Println("Received argument from JavaScript:", arg)

		// 假設 sayHello 函數返回一個 Go struct
		response := struct {
			Message string `json:"message"`
		}{
			Message: fmt.Sprintf("Hello, %s from Go!", arg),
		}

		// 將 Go struct 轉換為 JSON 字符串
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			fmt.Println("Error marshaling JSON:", err)
			return nil
		}

		// 將 JSON 字符串返回給 JavaScript
		return js.ValueOf(string(jsonResponse))
	}

	return js.ValueOf(string("go!"))

}
func sayHelloGo() string {
	return "Hello, WebAssembly!"
}
*/

func handlePostRequest(w http.ResponseWriter, r *http.Request) {
	// 解析JSON请求体
	//var requestData RequestData

	var requestData RequestData
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 处理请求数据
	receivedMessage := requestData.Message
	var result interface{}

	// 使用 switch 语句对接收到的消息进行筛选

	switch receivedMessage {

	case "211_Uniaxial_config_default":
		result = bleconfig.Uniaxial_config_default()
	default:
		result = "not true"
	}

	//result = requestData.DeviceID +"OK!"
	// 构建响应数据
	responseData := ResponseData{Result: result}

	// 将响应数据转换为JSON并发送回客户端
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)
}


func ReadFile211(w http.ResponseWriter, r *http.Request) {
	var requestData RequestData
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 处理请求数据
	receivedMessage := requestData.Message

	// 解析JSON请求体
	fileName := "../Server/www/211HM1/" + receivedMessage + ".txt"

	// 读取文件
	
	fileContent, err := os.ReadFile(fileName)
	

		//將讀取到的2進位檔案轉回json
		var data FileContent211
		err = json.Unmarshal(fileContent, &data)

		// Convert the FileContent struct to JSON and write it to the response
		//json.NewEncoder(w).Encode(data)

		
		// 构建响应数据
		responseData := ResponseData{Result: data}

		// 将响应数据转换为JSON并发送回客户端
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(responseData)
		fmt.Println(responseData)
	

	


}
func GetIoTech(w http.ResponseWriter, r *http.Request) {
	var requestData RequestData
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 处理请求数据
	//brokerHost mqttConPro
	ip := bleconfig.GetIP()
	receivedMessage := requestData.Message
    receivedMessage = "http://"+ ip + receivedMessage
	fmt.Println("Test URL:", receivedMessage)

	// 解析JSON请求体
	
	url  := receivedMessage
	fmt.Println(url)
	// 读取文件
	
	// 发起 GET 请求
	resp, err := http.Get(url)
	if err != nil {
		fmt.Println("Error making GET request:", err)
		return
	}
	defer resp.Body.Close()

	// 读取响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	// 解析 JSON 数据
	var responseData map[string]interface{}
	err = json.Unmarshal(body, &responseData)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return
	}

		// 构建响应数据
		responseData2 := ResponseData{Result: responseData}

		// 将响应数据转换为JSON并发送回客户端
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(responseData2)
		fmt.Println(responseData2)
}