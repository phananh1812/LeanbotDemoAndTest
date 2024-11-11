const resetColor = "#CCCCCC"; // màu mặc định (xám)

function logstatusWebName(text){
    logstatus(text + " - Standard Modules");
}

function handleSerialLine(line) {
    if (! line) return;
    console.log("Nano > " + line);

    const arrString = line.split(/[ \t]+/);
    checkCodefromLeanbot(arrString);

    if (checkCalibrationGripper) return CalibrationGripper_handle(arrString);
    if (arrString[0] === "TB" && checkmessage) return DemoTest_handle(arrString);
    UpdateBorderButtonDemo(arrString[0]);
}

function checkCodefromLeanbot(arrString){
    if (arrString[0] == "TB" && arrString[3] == "IR" &&  !checkmessage) {
        console.log("Message correct.");
        send(".RemoteControl");
        checkmessage = true;
        clearTimeout(timeoutCheckMessage);// Hủy kết thúc sau 5 giây
        UI('distanceValue').style.color  = "black";
        UI('textangle').style.color      = "black";
        UI('textangleLeft').style.color  = "black";
        UI('textangleRight').style.color = "black";
        UI('testIRLineCalibration').style.color = "black";
        buttonsTest.forEach(item => {
            item.style.color = "black";
        });
        gridItems.forEach(item => {
            item.style.removeProperty("color");
        });
        UI('textGripperCalibration').style.color = "black";
    }
}



function resetVariable() {
    // 1. Thiết lập lại hiển thị và giao diện
    tab1.style.display = "none";
    navbarTitle.style.color = "orange";
    UI("buttonText").innerText = "Scan";

    // 2. Đặt màu mặc định cho các phần tử
    UI('distanceValue').style.color = resetColor;
    UI('textangle').style.color = resetColor;
    UI('textangleLeft').style.color = resetColor;
    UI('textangleRight').style.color = resetColor;
    UI('testIRLineCalibration').style.color = resetColor;
    UI('distanceValue').style.fontSize = "13px";
    
    buttonsTest.forEach(item => item.style.color = resetColor);
    gridItems.forEach(item => {
        item.style.color = resetColor;
        item.style.border = `3px solid ${resetColor}`;
    });
    elements.forEach(item => item.style.color = resetColor);
    UI('distanceSlider').style.border = `3px solid ${resetColor}`;
    textGripperCalibration.style.color = resetColor;

    // 3. Đặt lại giá trị văn bản
    distanceValue.textContent = "HC-SR04 Ultrasonic distance";
    UI('textangleL').textContent = '';
    UI('textangleR').textContent = '';

    // 4. Đặt lại các timeout
    clearTimeout(Timeout10cm);
    clearTimeout(Timeout30cm);
    clearTimeout(timeoutCheckMessage);
    for (let i = 0; i < 12; i++) {
        clearTimeout(Timeout1[i]);
        clearTimeout(Timeout0[i]);
    }

    // 5. Đặt lại các giá trị mảng và biến cờ
    UI('distanceSlider').value = 0;
    checksum = Array(12).fill(0);
    check0 = Array(12).fill(0);
    check1 = Array(12).fill(0);
    Lastcommand1 = Array(12).fill(true);
    Lastcommand0 = Array(12).fill(true);
    check10cm = false;
    check30cm = false;
    checkClickDone = false;
    checkTestObjectDemo = false;
    checkCalibrationGripper = false;

    // 6. Đặt lại các giá trị biến đếm chạm
    const resetElements = ["TB1A", "TB1B", "TB2A", "TB2B"];
    resetElements.forEach((id, index) => {
        let paragraph = UI(id).querySelector('p');
        paragraph.innerHTML = `${id}<br>0`; // Sử dụng <br> để xuống dòng
        CountTouch[index] = 0; // Đặt lại CountTouch cho các phần tử này
        checkCoutTouch[index] = true; // Đặt lại checkCoutTouch
    });

    // 7. Thiết lập lại ngưỡng cho cảm biến
    threshold = Array(8).fill(map(100, 0, 768, 0, 255));

    // 8. Đặt lại màu cho các phần tử đặc biệt
    UI("text10cm").style.color = resetColor;
    UI("text30cm").style.color = resetColor;

    // 9. Đặt lại nền (nếu có hàm resetBackground())
    resetBackground();
}


let checkmessage = false;
let gridItems = document.querySelectorAll('.grid-item');
let buttonsTest = document.querySelectorAll('.buttonTest');
let elements = document.querySelectorAll("#text10cm, #text30cm");

if (!checkmessage) {
    const elements = [distanceValue, textangle, textangleLeft, textangleRight, textGripperCalibration, ...buttonsTest, ...gridItems];
    elements.forEach(item => {
        item.style.color = resetColor;
    });
}

let ir2L, ir0L, ir1R, ir3R, ir4L, ir6L, ir5R, ir7R;
let TB1A, TB1B, TB2A, TB2B;
let distance = "", angleL, angleR, distanceInt;
let lineState = "", report;
// let arrString;

const sliderbackground = UI('slider');

// Touch counters and check flags
let CountTouch = Array(4).fill(0);
let checkCoutTouch = Array(4).fill(true);

// Check variables for distance commands
let check10cm = false, check30cm = false;
let Lastcommand10cm = true, Lastcommand30cm = true;
let Timeout10cm, Timeout30cm;

// Arrays to track states and commands
let checkArray = [], checksum = [];
let check0 = Array(12).fill(false), check1 = Array(12).fill(false);
let Lastcommand0 = Array(12).fill(true), Lastcommand1 = Array(12).fill(true);
let Timeout0 = [], Timeout1 = [];


// Các id của IR và Touch trong Grid
const elementIds = [
    "TB1A", "TB1B", "TB2A", "TB2B", 
    "ir6L", "ir4L", "ir2L", "ir0L", 
    "ir1R", "ir3R", "ir5R", "ir7R"
];


// Initial Gripper Calibration
let old00L, old90L, old00R, old90R;
let angleLvalue, angleRvalue;
let textButtonGripperCalibration = UI('textGripperCalibration');
let checkCalibrationGripper = false;
// End Initial Gripper Calibration



function CalibrationGripper_handle(arrString){
    // Dùng .filter(Boolean) để giữ lại các phần tử không trống.
    // Sau đó, flatMap làm phẳng tất cả mảng con thành một mảng duy nhất (value).
    const value = arrString.flatMap(arr => arr.split(/[\(\),]/).filter(Boolean));
    console.log("Value: " + value);
    
    switch(value[0]){ 
        case 'GetCalibration'    : return GetCalibration(value);
        case 'degL'              : return UpdateAngleValue(value);
        case 'OpenPosition'      : return Step1();
        case 'ClosePosition'     : return Step2();
        case 'SetCalibration'    : return Step3();
        case 'Touch'             : return Step4();
        case 'TB1A'              : return CalibrationDone();
    }
}

function UpdateAngleValue(arrString){
    angleLvalue = arrString[2];
    angleRvalue = arrString[5];
    if(angleLvalue !== UI('angleLvalueCali').value || angleRvalue !== UI('angleRvalueCali').value) alert('WRONG MESSAGE!');
}

function GetCalibration(arrString){
    handleAction(',Step1');
    old00L = arrString[1];
    old90L = arrString[2];
    old00R = arrString[3];
    old90R = arrString[4];
    console.log("Gripper: " + old00L + "," + old90L + "," + old00R + "," + old90R);
}

function DemoTest_handle(arrString){
    // String: TB,0000,-,IR,0001,255,92,16,19,16,47,104,255,-,1000,cm,-,GR,0,0 
    updateTouchValue(arrString[1]);
    updateIRValue(arrString);
    updateAllBackground();
    updateDistanceValue(arrString[14]);
    updateGripperValue(arrString[18], arrString[19]);
}

function updateTouchValue(TB){
    for (let i = 0; i < 4; i++) {
        checkArray[i] = parseInt(TB[i]);

        let paragraph =  UI(elementIds[i]).querySelector('p'); // Tìm phần tử <p> bên trong div
        
        // Cập nhật giá trị CountTouch
        if (checkArray[i] === 1 && checkCoutTouch[i]) {
            checkCoutTouch[i] = false;
            CountTouch[i]++;
            paragraph.innerHTML = elementIds[i] + "<br>" + CountTouch[i];
        }
        else if(checkArray[i] === 0){
            checkCoutTouch[i] = true;
        }
        // Chuyển màu viền của Touch
        if(CountTouch[i] === 1){
            UI(elementIds[i]).style.border = "3px solid orange";
        }
        else if(CountTouch[i] === 3){
            UI(elementIds[i]).style.border = "3px solid green";
            checksum[i] = 1;
        }
        // Chuyển màu nền của Touch
        updateBackground(elementIds[i], checkArray[i]);
    }
}

function updateIRValue(arrString){ 
    for (let i = 0; i < 8; i++) {
        checkArray[i + 4] = compareThreshold(arrString, i);
        let paragraph = UI(elementIds[i + 4]).querySelector('p'); // Tìm phần tử <p> bên trong div
        // Cập nhật giá trị IR
        paragraph.innerHTML = elementIds[i + 4] + "<br>" + arrString[i + 5];
        // Chuyển màu viền của IR
        handleBorderChange(i + 4, UI(elementIds[i + 4]), check1, Lastcommand1, Timeout1, 1);
        handleBorderChange(i + 4, UI(elementIds[i + 4]), check0, Lastcommand0, Timeout0, 0);
        if (check0[i + 4] && check1[i + 4] ) {
            checksum[i + 4] = 1;
            UI(elementIds[i + 4]).style.border = "3px solid green";
        }
    }
}

function updateGripperValue(angleLeft, angleRight) {
    angleL = angleLeft;
    angleR = angleRight;
    UI('textangleL').textContent = `${angleLeft}°`;
    UI('textangleR').textContent = `${angleRight}°`;
}

function updateDistanceValue(distance) {
    handleDistance(distance);
    handle10cmCheck(distance);
    handle30cmCheck(distance);
    updateDistanceDisplay(distance);
}

function handleDistance(distance) {
    distanceInt = parseInt(distance);
    if (distanceInt > 50) {
        testObjectfollow.style.color = resetColor;
        return;
    }
    if (checkTestObjectDemo) {
        UI('infoContent').style.display = 'none';
        checkClickDone = false;
        runTest("Objectfollow", ".Objectfollow");
        checkTestObjectDemo = false;
    }
    testObjectfollow.style.color = "green";
}

function handle10cmCheck(distance) {
    if (check10cm) return;
    
    if (distance === '10') {
        UI("text10cm").style.color = "orange";
        if (Lastcommand10cm) {
            Timeout10cm = setTimeout(() => {
                UI("text10cm").style.color = "green";
                check10cm = true;
            }, 3000);
        }
        Lastcommand10cm = false;
    } else {
        UI("text10cm").style.color = resetColor;
        clearTimeout(Timeout10cm);
        Lastcommand10cm = true;
    }
}

function handle30cmCheck(distance) {
    if (check30cm) return;
    
    if (distance === '30') {
        UI("text30cm").style.color = "orange";
        if (Lastcommand30cm) {
            Timeout30cm = setTimeout(() => {
                UI("text30cm").style.color = "green";
                check30cm = true;
            }, 3000);
        }
        Lastcommand30cm = false;
    } else {
        UI("text30cm").style.color = resetColor;
        clearTimeout(Timeout30cm);
        Lastcommand30cm = true;
    }
}

function updateDistanceDisplay(distance) {
    distanceValue.textContent = (distance === "1000") ? "HC-SR04 Ultrasonic distance" : `${distance} cm`;
    distanceValue.style.fontSize = (distance === "1000") ? "13px" : "20px";
    UI('distanceSlider').value = distance;
    if (check10cm && check30cm) {
        distanceValue.style.color = "green";
        UI('distanceSlider').style.border = "3px solid green";
    }
}


let threshold = Array(8).fill(map(100, 0, 768, 0, 255));

function map(value, in_min, in_max, out_min, out_max) {
    return parseInt((value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

function compareThreshold(arrString, index) {
    let irValue = parseInt(arrString[index + 5]);
    threshold[index] = parseFloat((Math.min(threshold[index], irValue * 1.8))).toFixed(1);
    return irValue > threshold[index] ? 1 : 0;
}

function handleBorderChange(i, element, check, lastCommand, timeout, value) {
    if (check[i]) return;

    if(checkArray[i] === value) {
        element.style.border = "3px solid orange";
        if (lastCommand[i]) {
            timeout[i] = setTimeout(() => {
                element.style.border = "3px solid #CCCCCC";
                check[i] = true;
            }, 2000);
        }
        lastCommand[i] = false;
    } else {
        clearTimeout(timeout[i]);
        lastCommand[i] = true;
    }
}

function updateBackground(id, value) {
    if (value === 0) {
        UI(id).classList.remove('black');
        UI(id).classList.add('white');
    } else {
        if(id == "TB1A" || id == "TB1B" || id == "TB2A" || id == "TB2B" ){
            UI(id).classList.remove('white');
            UI(id).classList.add('red');
        }
        else{
            UI(id).classList.remove('white');
            UI(id).classList.add('black');
        }
    }
}

function handleTimeoutCheck(check, array, lastCommand, timeout) {
    for (let i = 0; i < 12; i++) {
        if (check[i])  return;

        if (array[i] === '1') {
            if (lastCommand[i]) {
                timeout[i] = setTimeout(() => {
                    check[i] = true;
                }, 3000);
            }
            lastCommand[i] = false;
        } else {
            clearTimeout(timeout[i]);
            lastCommand[i] = true;
        }
    }
}

function updateAllBackground() {
    const elements = [
        ['TB1A', checkArray[0]], ['TB1B', checkArray[1]], ['TB2A', checkArray[2]], ['TB2B', checkArray[3]],
        ['ir6L', checkArray[4]], ['ir4L', checkArray[5]], ['ir2L', checkArray[6]], ['ir0L', checkArray[7]],
        ['ir1R', checkArray[8]], ['ir3R', checkArray[9]], ['ir5R', checkArray[10]], ['ir7R', checkArray[11]]
    ];
    elements.forEach(([id, value]) => updateBackground(id, value));
}

let checkButtonGreen = [0, 0, 0, 0, 0, 0, 0];

function UpdateBorderButtonDemo(report){

    if(report == 'Gripper'){
        UI("testGripper").style.border = "3px solid green";
        checkButtonGreen[0] = 1;
        checkClickDone = false;
    }
    if(report == 'Motion'){
        UI("testMotor").style.border = "3px solid green";
        checkButtonGreen[1] = 1;
        checkClickDone = false;
    }
    if(report == 'RGBLeds'){
        UI("testLed").style.border = "3px solid green";
        checkButtonGreen[2] = 1;
        checkClickDone = false;
    }
    if(report == 'Buzzer'){
        UI("testBuzzer").style.border = "3px solid green"; 
        checkButtonGreen[3] = 1;
        checkClickDone = false;
    }
    if(report == 'StraightMotion'){
        UI("testStraightMotion").style.border = "3px solid green"; 
        checkButtonGreen[4] = 1;
        checkClickDone = false;
    }
    if(report == 'LineFollow'){
        UI("testFollowline").style.border = "3px solid green"; 
        checkButtonGreen[5] = 1;
        checkClickDone = false;
    }
    if(report == 'Objectfollow'){
        UI("testObjectfollow").style.border = "3px solid green"; 
        checkButtonGreen[6] = 1;
        checkClickDone = false;
    }
}

function areAllElementsEqualToOne(arr) {
    for (let i = 0; i < arr.length; i++) if (arr[i] !== 1) return false;
    return true;
}

function resetBackground() {
    const elements = ['ir2L', 'ir0L', 'ir1R', 'ir3R', 'ir4L', 'ir6L', 'ir5R', 'ir7R', 'TB1A', 'TB1B', 'TB2A', 'TB2B'];
    elements.forEach(id => updateBackground(id, 0));
}

let checkClickDone = false;
    // Thực hiện send và đổi màu viền khi click
function runTest(component, command){
    if(checkmessage && !checkClickDone){
        console.log("Command: " + command);
        send(command);
        element = UI("test" + component);
        element.style.border = "3px solid orange";
        checkClickDone = true;
        // resetBackground();
    }
}

const angleValues = ["0", "-30" , "120" , "90", "45"];

function sendAngle(nextAngleL, nextAngleR){ 
    if (!checkClickDone) send([".GripperLR", toStr(nextAngleL, 3), toStr(nextAngleR, 3)].join(' '));
}

function buttonGripperLeft(){
    const currentIndexL = angleValues.indexOf(angleL);
    const nextIndexL = (currentIndexL + 1) % angleValues.length;
    sendAngle(angleValues[nextIndexL], angleR);
}

function buttonGripperRight(){
    const currentIndexR = angleValues.indexOf(angleR);
    const nextIndexR = (currentIndexR + 1) % angleValues.length;
    sendAngle(angleL, angleValues[nextIndexR]);
}

// Calibration  Gripper
function GripperCalibration() {
    if ( !checkmessage) return;

    if (tab1.style.display === "none" || tab1.style.display === "") {
        resetVariable();
        document.getElementById("buttonText").innerText = "Rescan";
        send(',GripperCalibration');
        checkCalibrationGripper = true;
        checkClickDone = true;
        tab1.style.display = "block"; // Show the element
    } else {
        tab1.style.display = "none";   // Hide the element if it's visible
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const buttonSets = [
      { decrement: '.L0decrement', increment: '.L0increment', input: '.angleLvalueCali', step: 1 },
      { decrement: '.R0decrement', increment: '.R0increment', input: '.angleRvalueCali', step: 1 },
      { decrement: '.L90decrement', increment: '.L90increment', input: '.angleLvalueCali', step: 1 },
      { decrement: '.R90decrement', increment: '.R90increment', input: '.angleRvalueCali', step: 1 },
      { decrement: '.L0_5decrement', increment: '.L0_5increment', input: '.angleLvalueCali', step: 5 },
      { decrement: '.R0_5decrement', increment: '.R0_5increment', input: '.angleRvalueCali', step: 5 },
      { decrement: '.L90_5decrement', increment: '.L90_5increment', input: '.angleLvalueCali', step: 5 },
      { decrement: '.R90_5decrement', increment: '.R90_5increment', input: '.angleRvalueCali', step: 5 },
    ];
  
    buttonSets.forEach(({ decrement, increment, input, step}) => {
      const decrementBtn = document.querySelector(decrement);
      const incrementBtn = document.querySelector(increment);
      const quantityInput = document.querySelector(input);
      let intervalId;
  
      decrementBtn.addEventListener('pointerdown', startDecrement);
      decrementBtn.addEventListener('click', decrementValue);
      decrementBtn.addEventListener('pointerleave', stopDecrement);
      decrementBtn.addEventListener('pointerup', stopDecrement);
  
      incrementBtn.addEventListener('pointerdown', startIncrement);
      incrementBtn.addEventListener('click', incrementValue);
      incrementBtn.addEventListener('pointerleave', stopIncrement);
      incrementBtn.addEventListener('pointerup', stopIncrement);
      
  
      function startDecrement(event) {
        intervalId = setInterval(() => decrementValue(event), 400);
      }
  
      function stopDecrement() {
        clearInterval(intervalId);
      }
  
      function startIncrement(event) {
        intervalId = setInterval(() => incrementValue(event), 400);
      }
  
      function stopIncrement() {
        clearInterval(intervalId);
      }
      
      function decrementValue(event) {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue - step;
        sendLR();
      }
  
      function incrementValue(event) {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + step;
        sendLR();
      }
    });
});

function handleAction(action) {
    send(action);
}

function sendLR(){
    send (',LR' + ' ' + UI('angleLvalueCali').value + ' ' + UI('angleRvalueCali').value);
}

let Step = 0;

function Next() {
    console.log("Step: " + Step);
    if(Step == 1){
        handleAction(',Step2');
    }
    else if(Step == 2){
        handleAction(',Step3');
    }
    else if(Step == 3){
        handleAction(',Step4');
    }
}

function Step1(){
    Step = 1;
    UI("Next").innerText = "Next";
    UI('textareaCali').value = "Step 1/4: Adjust both gripper arms to proper 0° position (pointing down)";
    UI('angleRvalueCali').value = old00R;
    UI('angleLvalueCali').value = old00L;
    sendLR();
    toggleDisplayForElements(["R0increment", "R0decrement", "L0increment", "L0decrement",
                            "R0_5increment", "R0_5decrement", "L0_5increment", "L0_5decrement"], "block");
    toggleDisplayForElements(["R90increment", "R90decrement", "L90increment", "L90decrement",
                            "R90_5increment", "R90_5decrement", "L90_5increment", "L90_5decrement"], "none");
    toggleDisplayForElements(["Next"], "block");
}

function Step2(){
    Step = 2;
    UI("Next").innerText = "Next";
    UI('textareaCali').value = "Step 2/4: Adjust both gripper arms to proper 90° position (pointing horizontally)";
    toggleDisplayForElements(["R90increment", "R90decrement", "L90increment", "L90decrement",
                               "R90_5increment", "R90_5decrement", "L90_5increment", "L90_5decrement" ], "block");
    toggleDisplayForElements(["R0increment", "R0decrement", "L0increment", "L0decrement", 
                              "R0_5increment", "R0_5decrement", "L0_5increment", "L0_5decrement"], "none");
    UI('angleRvalueCali').value = old90R;
    UI('angleLvalueCali').value = old90L;
    sendLR();
}

function Step3(){
    Step = 3;
    UI("Next").innerText = "Save";
    UI('textareaCali').value = "Step 3/4: Observe gripper open and close correctly";
    toggleDisplayForElements(["R90increment", "R90decrement", "L90increment", "L90decrement",
                              "R90_5increment", "R90_5decrement", "L90_5increment", "L90_5decrement" ], "none");
}

function Step4(){
    Step = 4;
    UI('textareaCali').value = "Step 4/4: Touch TB1A + TB1B to permanently save calibration settings";
    UI("Next").innerText = "Done";
    toggleDisplayForElements(["Next"], "none");
}

function CalibrationDone(){
    UI('textareaCali').value = `TB1A + TB1B touched. Calibration settings saved. Calibration Done. Please Rescan Leanbot`;
    Backbutton.style.display = "none";
    Cancelbutton.style.display = "none";
}


function toggleDisplayForElements(elementIds, displayValue) {
    elementIds.forEach(function(id) {
        if (UI(id)) UI(id).style.display = displayValue;
    });
}

function Back() {
    if(Step == 3){
        handleAction(',Step2');
    }
    else if(Step == 2){
        handleAction(',Step1');
    }
    else if(Step == 4){
        handleAction(',Step3');
    }
}

function Cancel(){
    tab1.style.display = "none";
    checkCalibrationGripper = false;
    checkClickDone = false;
}

let MarioRTTTL = "mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a5,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a5,16f6,8g6,8e6,16c6,16d6,8b,8p,16g6,16f#6,16f6,16d#6,16p,16e6,16p,16g#,16a,16c6,16p,16a,16c6,16d6,8p,16g6,16f#6,16f6,16d#6,16p,16e6,16p,16c7,16p,16c7,16c7,p,16g6,16f#6,16f6,16d#6,16p,16e6,16p,16g#,16a,16c6,16p,16a,16c6,16d6,8p,16d#6,8p,16d6,8p,16c6";
function TestBuzzer(){
    runTest("Buzzer", ".Buzzer " + MarioRTTTL);
}

function TestGripper(){
    runTest("Gripper", ".Gripper");
}

function TestLed(){
    runTest("Led", ".RGBLeds");
}

function TestMotor(){
    runTest("Motor", ".Motion");
}

let checkAlertFollowLine = false;

function TestLineFollow(){
    if(!checkmessage) return;

    if(lineState !== '1111' && lineState !== '0000'){
        runTest(
            "Followline",
            [
                ".LineFollow",
                toStr(threshold[2], 3),
                toStr(threshold[3], 3),
                toStr(threshold[4], 3),
                toStr(threshold[5], 3),
            ].join(' ')
        );     
    }
    else{
        UI('customAlertFollowLine').style.display = 'block';
        checkClickDone = true;
        checkAlertFollowLine = true;
    }
}

function TestStraightMotion(){
    runTest("StraightMotion",".StraightMotion");
}

let checkTestObjectDemo = false;

function TestObjectfollow(){
    if (!checkmessage) return;
    if (distanceInt <= 50) return runTest("Objectfollow",".Objectfollow");
    
    // Hiển thị thông báo khi khoảng cách không đạt yêu cầu
    UI('infoContent').style.display = 'block';
    checkTestObjectDemo = true;
    checkClickDone = true;
}

function TestIRLineCalibration(){
    if(checkmessage) return send(".IRLine");
}

function toStr(value, length) {
    // Chuyển đổi giá trị thành số nguyên
    const intValue = parseInt(value);
    // Chuyển đổi số nguyên thành chuỗi và thêm số 0 ở phía trước nếu độ dài của chuỗi nhỏ hơn `length`
    return String(intValue).padStart(length, '0');
}

function closeCustomAlert() {
    UI('customAlert').style.display = 'none';
    checkClickDone = false;
    checkTestObjectDemo = false;
}

function closeCustomAlertFollowLine() {
    UI('customAlertFollowLine').style.display = 'none';
    checkClickDone = false;
    checkAlertFollowLine = false;
}

function closeAlertErrorCode(){
    UI('infopopup').style.display = 'none';
}
  
document.addEventListener('DOMContentLoaded', function () {  
    UI('infoButton').addEventListener('click', function (event) {
        event.stopPropagation(); // Ngăn chặn sự kiện click lan sang các phần tử cha
        if (UI('infoContent').style.display === 'block') {
            UI('infoContent').style.display = 'none';
        } else {
            UI('infoContent').style.display = 'block';
        }
    });
  
    document.addEventListener('click', function () {
        UI('infoContent').style.display = 'none';
    });
});