document.addEventListener("DOMContentLoaded", function () {
    const deviceContainer = document.getElementById("deviceContainer");
    const devicesList = document.getElementById("devicesList");
    const deviceFields = document.getElementById("deviceFields");
    const buttons = document.getElementById("buttons");
    const deviceButtons = document.querySelectorAll(".deviceButton");

    deviceContainer.addEventListener("click", function (event) {
        if (event.target.classList.contains("deviceButton")) {
            const deviceNumber = event.target.getAttribute("data-device");

            // 隱藏所有設備按鈕
            deviceButtons.forEach(button => button.style.display = "none");

            // 隱藏所有設備
            deviceContainer.style.display = "none";

            // 顯示文字框
            deviceFields.innerHTML = ""; // 清空現有內容
            for (let i = 1; i <= 10; i++) {
                const textField = document.createElement("input");
                textField.type = "text";
                textField.value = i;
                textField.style.fontWeight = "bold"; // 设置文本框为粗体

                // 创建带有"數值X"的文本节点
                const textLabel = document.createTextNode("數值" + i + ": ");
                deviceFields.appendChild(textLabel);
                deviceFields.appendChild(textField);

                // 创建换行标签
                const lineBreak = document.createElement("br");
                deviceFields.appendChild(lineBreak);
            }

            // 顯示"送出"和"回到初始網頁"按鈕
            buttons.style.display = "block";

            // 顯示文字框和返回按鈕
            deviceFields.style.display = "block";
            devicesList.style.display = "block";
        }
    });

    document.getElementById("backButton").addEventListener("click", function () {
        // 顯示所有設備按鈕
        deviceButtons.forEach(button => button.style.display = "block");

        // 顯示所有設備
        deviceContainer.style.display = "flex";

        // 隱藏文字框和按鈕
        deviceFields.style.display = "none";
        buttons.style.display = "none";
        devicesList.style.display = "none";
    });
	    submitButton.addEventListener("click", function () {
        const textFields = deviceFields.querySelectorAll("input");
        let concatenatedString = "";

        // 连接文本框中的字符串
        textFields.forEach(textField => {
            concatenatedString += textField.value + ", ";
        });

        // 去除最后的逗号和空格
        concatenatedString = concatenatedString.slice(0, -2);

        // 显示连接后的字符串
        alert("連接后的字符串: " + concatenatedString);
    });
});