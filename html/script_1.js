//240102



//全域變數
var urlIn = "";
var deviceInform00 = [];
var deviceInform01 = [];
var deviceInform03 = [];
var timeoutDuration = 10000; // API timeout時間

document.addEventListener("DOMContentLoaded", function () {

	const ModuleContainer = document.getElementById("sidebar");
	const deviceContainer0 = document.getElementById("deviceContainer0");
	const deviceContainer1 = document.getElementById("deviceContainer1");
	const deviceContainer4 = document.getElementById("deviceContainer4");
	//get all of the device inform 
	urlIn = ":59881/api/v2/device/all?offset=0&limit=999";
	ReadURL(urlIn)
		.then(result => {
			console.log(result); // 处理获取的数据
			devLen = result.devices.length;
			const devNameArray = [];
			const devtagsArray = [];
			for (let i = 0; i < devLen; i++) {
				devNameArray[i] = result.devices[i].name;
				if (result.devices[i].tags && result.devices[i].tags.SensorID) {
					devtagsArray[i] = result.devices[i].tags.SensorID;
				} else {
					devtagsArray[i] = "";
				}

				console.log(devNameArray[i], " is ", devtagsArray[i]); // 处理获取的数据


			}
			const combinedArray = devNameArray.map((name, index) => ({ name, deviceID: devtagsArray[index] }));
			combinedArray.sort((a, b) => {
				// 提取編號的前兩位數字進行比較
				const aPrefix = a.deviceID.substring(0, 2);
				const bPrefix = b.deviceID.substring(0, 2);

				return aPrefix.localeCompare(bPrefix) || a.deviceID.localeCompare(b.deviceID);
			});
			//分析開頭 00 01 03
			const groupedArrays = combinedArray.reduce((result, item) => {
				const prefix = item.deviceID.substring(0, 2);
				if (!result[prefix]) {
					result[prefix] = [];
				}
				result[prefix].push(item);
				return result;
			}, {});
			// 輸出三個矩陣
			/*
			console.log(groupedArrays['00']);
			console.log(groupedArrays['01']);
			console.log(groupedArrays['03']);
	*/

			deviceInform00 = groupedArrays['00'];
			deviceInform01 = groupedArrays['01'];
			deviceInform03 = groupedArrays['03'];
			/*
					 //印出從IoTech中撈到並分類好的設備分類，包含name與DeviceID
					 console.log(deviceInform00);
					 console.log(deviceInform01);
					 console.log(deviceInform03);
			*/
			//模擬從IOTech中拿到device有三個

			var txtFiles00 = [];
			var txtFiles01 = [];
			var txtFiles03 = [];
			for (let i = 0; i < deviceInform00.length; i++) {
				txtFiles00[i] = deviceInform00[i].deviceID + ".txt";
				//console.log(txtFiles00[i]); //印出找尋的txt檔名
			}
			for (let i = 0; i < deviceInform01.length; i++) {
				txtFiles01[i] = deviceInform01[i].deviceID + ".txt";
				//console.log(txtFiles01[i]);//印出找尋的txt檔名
			}
			for (let i = 0; i < deviceInform03.length; i++) {
				txtFiles03[i] = deviceInform03[i].deviceID + ".txt";
				//console.log(txtFiles03[i]);//印出找尋的txt檔名
			}
			//生成00欄位
			if (txtFiles00.length > 0) {
				txtFiles00.forEach((fileName, index) => {
					// 创建设备DIV
					const deviceDiv = document.createElement('div');
					deviceDiv.className = 'device';
					//deviceDiv.id = `device${index + 1}`;
					//deviceDiv.id = fileName.match(/\d+/)[0];
					deviceDiv.name = deviceInform00[index].name;
					deviceDiv.id = deviceInform00[index].deviceID;
					for (let j = 0; j < devLen; j++) {
						if (deviceDiv.name == result.devices[j].name) {
							console.log("find", result.devices[j].name);
							if (result.devices[j].operatingState != "DOWN") {
								//console.log("Status is Online");
								deviceDiv.live = false;

							} else {
								//console.log("Status is Offline");
								deviceDiv.live = true;
							}
							break;
						}
					}
					//console.log( deviceDiv.id);
					// 创建图片元素
					const img = document.createElement('img');
					img.src = './211HM1-B1.jpg';
					img.alt = '設備';

					// 创建按钮元素
					const button = document.createElement('button');
					button.className = 'deviceButton';
					button.dataset.device = index + 1;
					//button.textContent = `Device ${index + 1}\n${fileName}`;
					//button.textContent = deviceDiv.id;
					button.textContent = deviceInform00[index].name;
					if (deviceDiv.live == true) button.textContent = button.textContent + " (Offline)";
					// 将图片和按钮添加到设备DIV中
					deviceDiv.appendChild(img);
					deviceDiv.appendChild(button);

					// 将设备DIV添加到设备容器中
					deviceContainer1.appendChild(deviceDiv);
				});
			}
			if (txtFiles01.length > 0) {
				txtFiles01.forEach((fileName, index) => {
					// 创建设备DIV
					const deviceDiv = document.createElement('div');
					deviceDiv.className = 'device';
					//deviceDiv.id = `device${index + 1}`;
					//deviceDiv.id = fileName.match(/\d+/)[0];
					deviceDiv.name = deviceInform01[index].name;
					deviceDiv.id = deviceInform01[index].deviceID;
					for (let j = 0; j < devLen; j++) {
						if (deviceDiv.name == result.devices[j].name) {
							console.log("find", result.devices[j].name);
							if (result.devices[j].operatingState != "DOWN") {
								//console.log("Status is Online");
								deviceDiv.live = false;

							} else {
								//console.log("Status is Offline");
								deviceDiv.live = true;
							}
							break;
						}
					}
					//console.log( deviceDiv.id);
					// 创建图片元素
					const img = document.createElement('img');
					img.src = './213MM1-B1.jpg';
					img.alt = '設備';

					// 创建按钮元素
					const button = document.createElement('button');
					button.className = 'deviceButton';
					button.dataset.device = index + 1;
					//button.textContent = `Device ${index + 1}\n${fileName}`;
					//button.textContent = deviceDiv.id;
					button.textContent = deviceInform01[index].name;
					if (deviceDiv.live == true) button.textContent = button.textContent + " (Offline)";
					// 将图片和按钮添加到设备DIV中
					deviceDiv.appendChild(img);
					deviceDiv.appendChild(button);

					// 将设备DIV添加到设备容器中
					deviceContainer2.appendChild(deviceDiv);
				});
			}
			if (txtFiles03.length > 0) {
				txtFiles03.forEach((fileName, index) => {
					// 创建设备DIV
					const deviceDiv = document.createElement('div');
					deviceDiv.className = 'device';
					//deviceDiv.id = `device${index + 1}`;
					//deviceDiv.id = fileName.match(/\d+/)[0];
					deviceDiv.name = deviceInform03[index].name;
					deviceDiv.id = deviceInform03[index].deviceID;
					for (let j = 0; j < devLen; j++) {
						if (deviceDiv.name == result.devices[j].name) {
							console.log("find", result.devices[j].name);
							if (result.devices[j].operatingState != "DOWN") {
								//console.log("Status is Online");
								deviceDiv.live = false;

							} else {
								//console.log("Status is Offline");
								deviceDiv.live = true;
							}
							break;
						}
					}
					//console.log( deviceDiv.id);
					// 创建图片元素
					const img = document.createElement('img');
					img.src = './213MM2-R1.jpg';
					img.alt = '設備';

					// 创建按钮元素
					const button = document.createElement('button');
					button.className = 'deviceButton';
					button.dataset.device = index + 1;
					//button.textContent = `Device ${index + 1}\n${fileName}`;
					//button.textContent = deviceDiv.id;
					button.textContent = deviceInform03[index].name;
					if (deviceDiv.live == true) button.textContent = button.textContent + " (Offline)";
					// 将图片和按钮添加到设备DIV中
					deviceDiv.appendChild(img);
					deviceDiv.appendChild(button);

					// 将设备DIV添加到设备容器中
					deviceContainer3.appendChild(deviceDiv);
				});
			}

			//console.log(devLen,devLen,devLen); // 处理获取的数据
		})
		.catch(error => {
			console.error('無法查詢所有設備資訊:', error);
		});

	const deviceContainer2 = document.getElementById("deviceContainer2");
	const deviceContainer3 = document.getElementById("deviceContainer3");
	const devicesList = document.getElementById("devicesList");
	const deviceFields = document.getElementById("deviceFields");
	const buttons = document.getElementById("buttons");
	const deviceButtons = document.querySelectorAll(".deviceButton");


	sidebar.addEventListener("click", function (event) {

		//deviceFields.style.display = "none";
		//devicesList.style.display = "none";

		if (event.target.classList.contains("sidebarButton")) {
			const ModuleNumber = event.target.getAttribute("data-module");
			deviceFields.style.display = "none";
			devicesList.style.display = "none";
			deviceButtons.forEach(button => button.style.display = "block");
			buttons.style.display = "block";

			if (ModuleNumber == 0) {
				ReadMqttBridge();
				deviceContainer0.style.display = "flex";
				deviceContainer1.style.display = "none";
				deviceContainer2.style.display = "none";
				deviceContainer3.style.display = "none";
				deviceContainer4.style.display = "none";
			} else if (ModuleNumber == 1) {
				deviceContainer0.style.display = "none";
				deviceContainer1.style.display = "flex";
				deviceContainer2.style.display = "none";
				deviceContainer3.style.display = "none";
				deviceContainer4.style.display = "none";
			} else if (ModuleNumber == 2) {
				deviceContainer0.style.display = "none";
				deviceContainer1.style.display = "none";
				deviceContainer2.style.display = "flex";
				deviceContainer3.style.display = "none";
				deviceContainer4.style.display = "none";
			} else if (ModuleNumber == 3) {
				deviceContainer1.style.display = "none";
				deviceContainer0.style.display = "none";
				deviceContainer2.style.display = "none";
				deviceContainer3.style.display = "flex";
				deviceContainer4.style.display = "none";
			} else if (ModuleNumber == 4) {

				ReadDeviceID();
				deviceContainer0.style.display = "none";
				deviceContainer1.style.display = "none";
				deviceContainer2.style.display = "none";
				deviceContainer3.style.display = "none";
				deviceContainer4.style.display = "flex";
			}

		}
	});
	deviceContainer4.addEventListener("click", function (event) {
		// 隱藏所有設備按鈕
		deviceButtons.forEach(button => button.style.display = "none");

		// 隱藏所有設備
		//deviceContainer4.style.display = "none"; //cilck is none
		//alert(JSON.stringify("0000"));
		// 清空设备字段
		deviceFields.innerHTML = "";

		// 显示 "送出" 和 "回到初始網頁" 按钮
		buttons.style.display = "none";

		// 显示文本框和返回按钮
		deviceFields.style.display = "none";
		devicesList.style.display = "none";
	});

	deviceContainer0.addEventListener("click", function (event) {

		// 隱藏所有設備按鈕
		deviceButtons.forEach(button => button.style.display = "none");

		// 隱藏所有設備
		//deviceContainer0.style.display = "none";
		//alert(JSON.stringify("0000"));
		// 清空设备字段
		deviceFields.innerHTML = "";

		// 显示 "送出" 和 "回到初始網頁" 按钮
		buttons.style.display = "none";

		// 显示文本框和返回按钮
		deviceFields.style.display = "none";
		devicesList.style.display = "none";
	});



	deviceContainer3.addEventListener("click", function (event) {

		if (event.target.classList.contains("deviceButton")) {
			const deviceNumber = event.target.getAttribute("data-device");
			//alert(deviceNumber);
			// 现在你可以使用 buttonId 进行需要的处理
			//console.log("Button ID: " + buttonId);

			// 隱藏所有設備按鈕
			deviceButtons.forEach(button => button.style.display = "none");

			// 隱藏所有設備
			deviceContainer3.style.display = "none";
			//alert(JSON.stringify("0000"));
			// 清空设备字段
			deviceFields.innerHTML = "";

			// 显示 "送出" 和 "回到初始網頁" 按钮
			buttons.style.display = "block";

			// 显示文本框和返回按钮
			deviceFields.style.display = "block";
			devicesList.style.display = "block";

			//document.write("112");

			if (0) {
				const go = new Go();
				alert("0");

				fetch("WebAPI.wasm")
					.then(response => response.arrayBuffer())
					.then(buffer => WebAssembly.instantiate(buffer, go.importObject))
					.then(result => {
						go.run(result.instance);
						const textField = document.createElement("input");
						textField.type = "text";
						const textGo = result.instance.exports.sayHello(); // 使用從 Go 返回的數據
						textField.value = textGo;
						console.log(textGo);
						textField.style.fontWeight = "bold";

						const textLabel = document.createTextNode("數值" + (10 + 1) + ": ");
						deviceFields.appendChild(textLabel);
						deviceFields.appendChild(textField);

						const lineBreak = document.createElement("br");
						deviceFields.appendChild(lineBreak);

						console.log("WebAssembly module loaded successfully.");
					})
					.catch(error => {
						console.error("Failed to load WebAssembly module:", error);
					});


			} else {










				if (deviceNumber == 1) {
					// 发起 GET 请求获取数据
					fetch("http://localhost:8080/data1", { method: 'GET' })
						.then(response => response.json()) // 使用 response.json() 获取 JSON 数据
						.then(data => {
							//alert(JSON.stringify("0000"));

							for (let i = 0; i < data.length; i++) {
								const textField = document.createElement("input");
								textField.type = "text";
								textField.value = data[i]; // 使用从 Go 返回的数据
								textField.style.fontWeight = "bold";

								const textLabel = document.createTextNode("數值" + (i + 1) + ": ");
								deviceFields.appendChild(textLabel);
								deviceFields.appendChild(textField);

								const lineBreak = document.createElement("br");
								deviceFields.appendChild(lineBreak);
							}
						})
				} else if (deviceNumber == 2) {
					// 发起 GET 请求获取数据
					fetch("http://localhost:8080/data2", { method: 'GET' })
						.then(response => response.json()) // 使用 response.json() 获取 JSON 数据
						.then(data => {
							//alert(JSON.stringify("0000"));

							for (let i = 0; i < data.length; i++) {
								const textField = document.createElement("input");
								textField.type = "text";
								textField.value = data[i]; // 使用从 Go 返回的数据
								textField.style.fontWeight = "bold";

								const textLabel = document.createTextNode("數值" + (i + 1) + ": ");
								deviceFields.appendChild(textLabel);
								deviceFields.appendChild(textField);

								const lineBreak = document.createElement("br");
								deviceFields.appendChild(lineBreak);
							}
						})
				} else {
					// 发起 GET 请求获取数据
					fetch("http://localhost:8080/data", { method: 'GET' })
						.then(response => response.json()) // 使用 response.json() 获取 JSON 数据
						.then(data => {
							//alert(JSON.stringify("0000"));

							for (let i = 0; i < data.length; i++) {
								const textField = document.createElement("input");
								textField.type = "text";
								textField.value = data[i]; // 使用从 Go 返回的数据
								textField.style.fontWeight = "bold";

								const textLabel = document.createTextNode("數值" + (i + 1) + ": ");
								deviceFields.appendChild(textLabel);
								deviceFields.appendChild(textField);

								const lineBreak = document.createElement("br");
								deviceFields.appendChild(lineBreak);
							}
						})
				}
			}
		}
	});

	//回上一頁
	document.getElementById("backButton").addEventListener("click", function () {
		// 顯示所有設備按鈕
		deviceButtons.forEach(button => button.style.display = "block");

		// 顯示所有設備
		deviceContainer1.style.display = "none";
		deviceContainer2.style.display = "none";
		deviceContainer3.style.display = "none";

		// 隱藏文字框和按鈕
		deviceFields.style.display = "none";
		buttons.style.display = "none";
		devicesList.style.display = "none";
	});

	//提交的按鈕
	submitButton.addEventListener("click", function () {
		const textFields = deviceFields.querySelectorAll("input");
		let concatenatedString = "";

		console.log(inputValues);

		//輸出txt檔案
		const jsonString = JSON.stringify(inputValues, null, 2);

		// 创建 Blob 对象
		const blob = new Blob([jsonString], { type: 'application/json' });

		// 创建下载链接
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		const DeviceIDNumber = inputValues.DeviceID;
		downloadLink.download = DeviceIDNumber + '.txt';

		// 添加链接到文档
		document.body.appendChild(downloadLink);

		// 模拟点击下载链接
		downloadLink.click();

		// 移除链接
		document.body.removeChild(downloadLink);


	});
});


async function ReadURL(message) {
	const requestData = {
		message: message
	};
	try {
		const response = await Promise.race([
			fetch("http://localhost:8080/GetIOTech", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData),
			}),
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error('Request timeout')), timeoutDuration)
			),
		]);

		if (!response.ok) {
			throw new Error(`HTTP timeout! Status: ${response.status}`);
		}
		const data = await response.json();
		return data.result;

	}
	catch (error) {
		console.error('URL連線錯誤:', error);
		// 在发生错误时可以返回一个默认值或者处理错误逻辑
		return null;
	}



}


function GetConfigFile211(message) {
	const requestData = {
		message: message
	};

	return new Promise((resolve, reject) => {
		fetch("http://localhost:8080/ReadConfigFile", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData),
		})

			.then(response => response.json())
			.then(data => {
				// 处理返回的数据
				resolve(data.result);
			})

	});
}

function GetDafultConfigFromServer(message) {
	const requestData = {
		message: message
	};

	return new Promise((resolve, reject) => {
		fetch("http://localhost:8080/postEndpoint", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData),
		})
			.then(response => response.json())
			.then(data => {
				// 处理返回的数据
				resolve(data.result);
			})
			.catch(error => {
				console.error('Error:', error);
				reject(error);
			});
	});
}
function createTableRow(textLabel, textValue, FuncValue, FuncIndex) {
	// 创建表格行的容器
	const rowContainer = document.createElement("a");
	//rowContainer.style.display = "flex";
	//rowContainer.style.alignItems = "center"; // 可选，使内容在垂直方向居中
	// 创建标签文本节点
	const label = document.createTextNode(textLabel);

	// 创建文本框
	const textField = document.createElement("input");
	textField.type = "text";
	textField.value = textValue;
	textField.style.fontWeight = "bold";

	// 添加 input 事件监听器
	document.body.addEventListener("input", function (event) {
		// 检查触发事件的元素是否是 textField
		if (event.target === textField) {
			// 当输入框的值变化时，更新 textValue 的值
			if (FuncValue == 11) {
				inputValues.DeviceID = event.target.value;
			} else if (FuncValue == 12) {
				inputValues.PIB_Array[FuncIndex].Band_Order = parseInt(event.target.value, 10);
			} else if (FuncValue == 13) {
				inputValues.PIB_Array[FuncIndex].Start = parseFloat(event.target.value);
			} else if (FuncValue == 14) {
				inputValues.PIB_Array[FuncIndex].Stop = parseFloat(event.target.value);
			} else if (FuncValue == 15) {
				inputValues.PIB_Array[FuncIndex].Magnification = parseInt(event.target.value, 10);
			} else if (FuncValue == 16) {
				inputValues.QC_Array[FuncIndex].Warning = parseFloat(event.target.value);
			} else if (FuncValue == 17) {
				inputValues.QC_Array[FuncIndex].Alarm = parseFloat(event.target.value);
			} else if (FuncValue == 18) {
				inputValues.RPM.RPM_S = parseInt(event.target.value, 10);
			} else if (FuncValue == 19) {
				inputValues.RPM.RPM_E = parseInt(event.target.value, 10);
			} else if (FuncValue == 20) {
				inputValues.Sensitivity = parseFloat(event.target.value);
			} else if (FuncValue == 21) {
				inputValues.Trigger_Level = parseFloat(event.target.value);
			}

			// console.log(inputValues);
		}
	});

	// 将标签和文本框添加到表格行容器中
	rowContainer.appendChild(label);
	rowContainer.appendChild(textField);
	//document.body.appendChild(rowContainer);
	deviceFields.appendChild(rowContainer);


	// 返回表格行容器
	//return rowContainer;
}
function createBR() {
	const lineBreak = document.createElement("br");
	deviceFields.appendChild(lineBreak);
}
function ReadDeviceID() {
	// 假設 data 是由外部提供的資料陣列


	var data = [

	];
	//get all of the device inform 
	urlIn = ":59881/api/v2/device/all?offset=0&limit=999"; //core-metadata :59881
	ReadURL(urlIn)
		.then(result => {
			console.log(result); // 处理获取的数据
			devLen = result.devices.length;
			for (let i = 0; i < devLen; i++) {
				Description = "";
				Labels = "";
				if (result.devices[i].description && result.devices[i].description != null) {
					Description = result.devices[i].description;
				}
				if (result.devices[i].labels && result.devices[i].labels != null) {
					Labels = result.devices[i].labels[0];
				}

				console.log(result.devices[i].name, Description, Labels);
				data.push({
					Name: result.devices[i].name,
					Protocol: result.devices[i].protocolName,
					Description: Description,
					Labels: Labels
				});
				//console.log( result.devices[i].name,result.devices[i].protocolName); // 处理获取的数据
				console.log(data[i]); // 处理获取的数据
			}

			var table = $('#DeviceTable').DataTable({
				data: data,
				columns: [
					{ data: 'Name' },
					{ data: 'Protocol' },
					{ data: 'Description' },
					{ data: 'Labels' },
					{
						data: null,
						render: function (data, type, row) {
							return '<button class="deviceButton2" onclick="handleTriggerClick(\'' + row.Name + '\')"><img src="./trigger-image.png" alt="Trigger" class="trigger-image"></button>';
						}
					}
				],
				select: true // 启用选择功能
			});

			//console.log(devLen,devLen,devLen); // 处理获取的数据
		})
		.catch(error => {
			console.error('無法查詢所有設備資訊:', error);
		});



}

function handleTriggerClick(name) {
	//alert('Trigger clicked for item: ' + name);
	//get SensorID by core-data
	checkCount = 10;
	urlIn = ":59880/api/v2/reading/device/name/" + name + "?offset=0&limit=" + checkCount; //用來撈MQTT Bridge用的 需要上線
	Device_ID = name;
	Module_Name = null;
	Sensor_ID = "";
	Bridge_UUID = "";
	Channel = "";
	Pipe = "";
	BLE_UUID = "";
	CheckDataCount = 0;
	ReadURL(urlIn)
		.then(result => { //ready get
			console.log(result); // 处理获取的数据
			for (var i = 0; i < checkCount; i++) {
				if (result.readings[i] && result.readings[i].resourceName == "Module_Name" && result.readings[i].value) {
					Module_Name = result.readings[i].value;
					CheckDataCount++;
				} else if (result.readings[i] && result.readings[i].resourceName == "Sensor_ID" && result.readings[i].value) {
					Sensor_ID = result.readings[i].value;
					CheckDataCount++;
				}
				else if (result.readings[i] && result.readings[i].resourceName == "BLE_UUID" && result.readings[i].value) {
					BLE_UUID = result.readings[i].value;
					CheckDataCount++;
				}
				else if (result.readings[i] && result.readings[i].resourceName == "Pipe" && result.readings[i].value) {
					Pipe = result.readings[i].value;
					CheckDataCount++;
				}
				else if (result.readings[i] && result.readings[i].resourceName == "Channel" && result.readings[i].value) {
					Channel = result.readings[i].value;
					CheckDataCount++;
				}
				else if (result.readings[i] && result.readings[i].resourceName == "Bridge_UUID" && result.readings[i].value) {
					Bridge_UUID = result.readings[i].value;
					CheckDataCount++;
				}
			}
			console.log(Module_Name);
			if (CheckDataCount < 6 && Module_Name!="213MM2-R1"  && Module_Name!=null) {
				alert(Device_ID + " 無法取得完整MQTT Bridge資訊，可能是因為下線了");
				deviceContainer1_CreatPage(Device_ID, Sensor_ID, Bridge_UUID, BLE_UUID, Channel, Pipe);
			} else if(Module_Name!=null && Module_Name=="211HM1-B1"){
				alert("Device ID: " + Device_ID + "\r\n" + "Sensor ID : " + Sensor_ID + "\r\n" + "Bridge UUID : " + Bridge_UUID + "\r\n"
					+ "BLE UUID : " + BLE_UUID + "\r\n" + "Channel : " + Channel + "\r\n" + "Pipe : " + Pipe);
				//add device configuration page
				deviceContainer1_CreatPage(Device_ID, Sensor_ID, Bridge_UUID, BLE_UUID, Channel, Pipe);

			}else if(Module_Name!=null && Module_Name=="213MM1-B1"){
				alert("Device ID: " + Device_ID + "\r\n" + "Sensor ID : " + Sensor_ID + "\r\n" + "Bridge UUID : " + Bridge_UUID + "\r\n"
					+ "BLE UUID : " + BLE_UUID + "\r\n" + "Channel : " + Channel + "\r\n" + "Pipe : " + Pipe);
				alert("尚未開發完成");

			}else if(Module_Name!=null && Module_Name=="213MM2-R1"){
				alert("尚未開發完成");
			}

		})
		.catch(error => {
			console.error('無法查詢所有設備資訊:', error);
		});

}


function ReadMqttBridge() {
	// 假設 data 是由外部提供的資料陣列
	const data = [
		{
			device: 'Device1',
			uuid: 'UUID1',
			bridge: 'Bridge1',
			channel: 'Channel1',
			pipe: 'Pipe1',
			sensor: 'Sensor1'
		},
		{
			device: 'Device2',
			uuid: 'UUID2',
			bridge: 'Bridge1',
			channel: 'Channel2',
			pipe: 'Pipe2',
			sensor: 'Sensor2'
		},
		{
			device: 'Device3',
			uuid: 'UUID3',
			bridge: 'Bridge3',
			channel: 'Channel3',
			pipe: 'Pipe3',
			sensor: 'Sensor3'
		},
		// 可以繼續新增其他資料
	];

	var table = $('#myTable').DataTable({
		data: data,
		columns: [
			{ data: 'device' },
			{ data: 'uuid' },
			{ data: 'bridge' },
			{ data: 'channel' },
			{ data: 'pipe' },
			{ data: 'sensor' }
		],
		select: true // 啟用選擇功能
	});


	//test
	urlIn = ":59881/api/v2/device/all?offset=0&limit=999";
	ReadURL(urlIn)
		.then(result => { //ready get
			console.log(result); // 处理获取的数据
			devLen = result.devices.length;
			const devNameArray = [];
			const devtagsArray = [];
			const devStateArray = [];
			for (let i = 0; i < devLen; i++) {
				devNameArray[i] = result.devices[i].name;
				devStateArray[i] = result.devices[i].operatingState;
				devtagsArray[i] = result.devices[i].tags.SensorID; //tage can not using sensorID
				console.log(devNameArray[i], " is ", devtagsArray[i], "State is ", devStateArray[i]); // 处理获取的数据
			}
		})
		.catch(error => {
			console.error('無法查詢所有設備資訊:', error);
		});
}
	//deviceContainer1.addEventListener("click", function (event) {
		function deviceContainer1_CreatPage(Device_ID, Sensor_ID, Bridge, BLE_UUID, Channel, Pipe) {
			//if (event.target.classList.contains("deviceButton")) {
			/*
			const clickedDeviceId = event.target.closest('.device').id;
			console.log('Clicked Device ID:', clickedDeviceId);
	
			const clickedDeviceName = event.target.closest('.device').name;
			console.log('Clicked Device Name:', clickedDeviceName);
	
			const clickedDeviceLive = event.target.closest('.device').live;
			if (clickedDeviceLive == true) {
				alert("device Offline!");
				console.log('Clicked Device Offline:', clickedDeviceLive);
			}
	
	
			const clickedDevice = event.target.closest('.device');
			console.log('Clicked Device inform:', clickedDevice);
	
			const deviceNumber = event.target.getAttribute("data-device");
			*/
	
			//alert(deviceNumber);
			// 现在你可以使用 buttonId 进行需要的处理
			//console.log("Button ID: " + buttonId);
	
			// 隱藏所有設備按鈕
			//deviceButtons.forEach(button => button.style.display = "none");
	
			// 隱藏所有設備
			deviceContainer4.style.display = "none";
			//alert(JSON.stringify("0000"));
			// 清空设备字段
			deviceFields.innerHTML = "";
	
			// 显示 "送出" 和 "回到初始網頁" 按钮
			buttons.style.display = "block";
	
			// 显示文本框和返回按钮
			deviceFields.style.display = "block";
			devicesList.style.display = "block";
	
			// 构建请求数据
			const message = [
				"211_Uniaxial_config_default",
			];
			const config_list = [
				"DeviceID",
				"PIB_Array",
				"QC_Array",
				"RPM",
				"Sensitivity",
				"Trigger_Level",
				"RPM_End",
				"RPM_Start",
			];
			let myHeaders = new Headers({
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'text/plain'
			});
			//在根目錄下211HM1中找clickedDeviceId.txt檔案並讀取
			//console.log('Clicked Device ID:', clickedDeviceId);
	
			const fileName = Device_ID;
	
			// 使用 fetch API 获取文件内容
			GetConfigFile211(fileName)
				.then(response => {
					//console.log(response);
					//if (1) {
					if (response.DeviceID == '') {
						GetDafultConfigFromServer(message[0])
							.then(result => {
								console.log(result);
	
								// 打印提取的值
								alert("找不到檔案，帶入預設值!");
								window.inputValues = result;
								//console.log(inputValues);
								result.DeviceID = Sensor_ID;
								//Device iD
								createTableRow(config_list[0], Sensor_ID, 11, 0);
								createBR();
								createTableRow("Sensitivity", result.Sensitivity, 20, 0);
								createBR();
								createTableRow("Trigger Level", result.Trigger_Level, 21, 0);
								createBR();
	
								//Power in band		
								for (let i = 0; i < result.PIB_Array.length; i++) {
									createTableRow("Band_Order " + (i + 1), result.PIB_Array[i].Band_Order, 12, i);
									createTableRow("Start " + (i + 1), result.PIB_Array[i].Start, 13, i);
									createTableRow("Stop " + (i + 1), result.PIB_Array[i].Stop, 14, i);
									createTableRow("Magnification " + (i + 1), result.PIB_Array[i].Magnification, 15, i);
									createBR();
								}
	
								//QC 14
								createTableRow("OA Warning", result.QC_Array[0].Warning, 16, 0);
								createTableRow("OA Alarm", result.QC_Array[0].Alarm, 17, 0);
								createBR();
								createTableRow("Peak Warning", result.QC_Array[1].Warning, 16, 1);
								createTableRow("Peak Alarm", result.QC_Array[1].Alarm, 17, 1);
								createBR();
								createTableRow("Peak to Peak Warning", result.QC_Array[2].Warning, 16, 2);
								createTableRow("Peak to Peak Alarm", result.QC_Array[2].Alarm, 17, 2);
								createBR();
								createTableRow("Crest Factor Warning", result.QC_Array[3].Warning, 16, 3);
								createTableRow("Crest Factor Alarm", result.QC_Array[3].Alarm, 17, 3);
								createBR();
								for (let i = 4; i < result.QC_Array.length; i++) {
									createTableRow("Power In Band Warning " + (i - 3), result.QC_Array[i].Warning, 16, i);
									createTableRow("Power In Band Alarm " + (i - 3), result.QC_Array[i].Alarm, 17, i);
									createBR();
								}
								//RPM
								createTableRow("RPM Start", result.RPM.RPM_S, 18, 0);
								createTableRow("RPM End", result.RPM.RPM_E, 19, 0);
								createBR();
	
							})
	
							.catch(error => {
								console.error('Error:', error);
							});
					} else {
						console.log("Read 211HM1 config file OK");
						//console.log(response);
						window.inputValues = response;
						//console.log(inputValues);
						response.DeviceID = Sensor_ID;
						//Device iD
						createTableRow(config_list[0], response.DeviceID, 11, 0);
						createBR();
						createTableRow("Sensitivity", response.Sensitivity, 20, 0);
						createBR();
						createTableRow("Trigger Level", response.Trigger_Level, 21, 0);
						createBR();
	
						//Power in band		
						for (let i = 0; i < response.PIB_Array.length; i++) {
							createTableRow("Band_Order " + (i + 1), response.PIB_Array[i].Band_Order, 12, i);
							createTableRow("Start " + (i + 1), response.PIB_Array[i].Start, 13, i);
							createTableRow("Stop " + (i + 1), response.PIB_Array[i].Stop, 14, i);
							createTableRow("Magnification " + (i + 1), response.PIB_Array[i].Magnification, 15, i);
							createBR();
						}
	
						//QC 14
						createTableRow("OA Warning", response.QC_Array[0].Warning, 16, 0);
						createTableRow("OA Alarm", response.QC_Array[0].Alarm, 17, 0);
						createBR();
						createTableRow("Peak Warning", response.QC_Array[1].Warning, 16, 1);
						createTableRow("Peak Alarm", response.QC_Array[1].Alarm, 17, 1);
						createBR();
						createTableRow("Peak to Peak Warning", response.QC_Array[2].Warning, 16, 2);
						createTableRow("Peak to Peak Alarm", response.QC_Array[2].Alarm, 17, 2);
						createBR();
						createTableRow("Crest Factor Warning", response.QC_Array[3].Warning, 16, 3);
						createTableRow("Crest Factor Alarm", response.QC_Array[3].Alarm, 17, 3);
						createBR();
						for (let i = 4; i < response.QC_Array.length; i++) {
							createTableRow("Power In Band Warning " + (i - 3), response.QC_Array[i].Warning, 16, i);
							createTableRow("Power In Band Alarm " + (i - 3), response.QC_Array[i].Alarm, 17, i);
							createBR();
						}
						//RPM
						createTableRow("RPM Start", response.RPM.RPM_S, 18, 0);
						createTableRow("RPM End", response.RPM.RPM_E, 19, 0);
						createBR();
					}
					//return response.text();
				})
	
	
				.catch(error => {
					console.error('Error during fetch:', error);
				});
	
	
			//}
			//});
		}