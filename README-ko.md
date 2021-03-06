# FlexibleHybrid

FlexibleHybridApp은 Web, Native 상호간의 Interface을 Promise로 구현하는 등, HybridApp을 개발하기 위해 여러 편의 기능을 제공하는 프레임워크 입니다.

# framework 추가 방법

podFile에 다음을 추가

```
    pod 'FlexHybridApp'
```

***iOS Deployment Target은 11.0 입니다.***  
***가장 최신 버전은 0.3.9.5 입니다.***

# Flex Framework 인터페이스 주요 특징
기본적으로 WKWebView userContentController에 여러가지 기능이 추가되었습니다.
1. Web에서 Native 함수 호출시, **Native함수의 Return이 Web에 Promise로** 전달됩니다.
2. Native에서 Web함수 호출시, **Web에서 Native로 Async**하게 반환값을 전달 할 수 있습니다.
3. WKWebViewConfiguration 대신, FlexComponent를 사용해야 합니다. FlexComponent는 WKWebViewConfiguration를 포함하고 있습니다.
4. userContentController와는 다르게, 각 인터페이스의 **네이티브 동작을 별도의 코드 블럭(Clouser)** 으로 지정할 수 있습니다.
5. Web에서 Native 호출시, **Native 코드 블럭은 Background(DispatchQoS.background)** 안에서 Concurrent하게 동작합니다
6. FlexWebView에 BaseUrl을 지정하여, **타 사이트 및 페이지에서 Native와 Interface하는 것을 방지**할 수 있습니다.

# Flex 인터페이스 구현
## 전달 가능한 데이터 타입
1. WKWebView userContentController와 같이 일반 자료형, 문자열, Array, Dictionary형식으로 전송 가능합니다. 
2. JS의 Array를 Swift의 Array\<Any>로, JS의 Object를 Swift의 Dictionary\<String,Any>으로 전송 가능합니다.  
3. Array와 Object형식의 데이터를 전송할 때 안에 포함된 데이터는 **반드시 아래 자료형 중 하나여야 합니다**.  

| JS | Swift |
|:--:|:--:|
| Number | Int, Float, Double |
| String | String, Character | 
| Boolean | Bool |
| Array [] | Array\<Any> |
| Object {} | Dictionary<String,Any> |
| undefined (Single Argument Only), null | nil |
| Error | FlexReject |

## WebToNative 인터페이스
WebToNative 인터페이스는 다음의 특징을 지닙니다.
1. 함수 return으로 값을 전달하는 Normal Interface, Method 호출로 값을 전달하는 Action Interface 2가지 종류
2. Clouser형태로 인터페이스 코드 블럭을 추가
3. Clouser는 별도의 Background(DispatchQoS.background)에서 동작
4. 추가된 인터페이스는 Web에서 $flex.함수명 형태로 호출 가능
5. $flex Object는 window.onFlexLoad가 호출된 이후 사용 가능

### ***Nomal Interface***
Normal Interface는 기본적으로 다음과 같이 사용합니다.
```swift
// in Swfit
flexComponent.setInterface("Normal") // "Normal" becomes the function name in Web JavaScript. 
{ arguments -> String in
    // arguments is Arguemnts Data from web. Type is Array<Any>
    // ["data1", 2, false]
    return "HiFlexWeb" // "HiFlexWeb" is passed to web in Promise pattern.
}
flexWebView = FlexWebView(frame: self.view.frame, component: flexComponent)
```
```js
// in web javascript
...
const res = await $flex.Normal("data1",2,false);
// res is "HiFlexWeb"
```
`setInterface`의 첫 인자로 웹에서의 함수 이름을 지정하고 이어지는 Clouser는 함수가 동작하는 코드 블럭이 됩니다.  
Clouser로 전달되는 arguments는 Array 객체로서 web에서 함수 호출시 전달된 값들이 담겨 있습니다.  
Clouser에서 web으로 값을 전달할 때(return할 때)는 [전달 가능한 데이터 타입](#전달-가능한-데이터-타입)만 사용 가능합니다.

### ***Action Interface***
Action Interface는 Normal Interface와 거의 비슷하나, Web으로의 값 리턴을 action객체의 `promiseReturn` 메소드를 호출하는 시점에 전달합니다.
```swift
// in Kotlin
var mAction: FlexAction? = nil
...
flexComponent.setAction("Action")
{ (action, arguments) -> Void in
// arguments is Array<Any>, ["Who Are You?"]
// action is FlexAction Object
    mAction = action
}
flexWebView = FlexWebView(frame: self.view.frame, component: flexComponent)
...
// Returns to the Web when calling promiseReturn.
mAction?.promiseReturn(["FlexAction!!!",100]);
mAction = nil
```
```js
// in web javascript
....
const res = await $flex.Action("Who Are You?"); // Pending until promiseReturn is called...
// res is ["FlexAction!!!", 100]
```
`promiseReturn`의 파라미터는 [전달 가능한 데이터 타입](#전달-가능한-데이터-타입)만 사용 가능합니다.  
`promiseReturn`메소드가 호출되지 못하면, web에서 해당 함수는 계속 pending된 상태가 되기 때문에 Action Interface를 사용시 `promiseReturn`를 ***반드시*** 호출할 수 있도록 주의가 필요합니다.  
전달값이 없다면, `resolveVoid()`를 대신 호출할 수 있습니다. 이는 `promiseReturn(nil)`과 동일합니다.  
또한 이미 `promiseReturn`가 호출되었던 FlexAction 객체는 `promiseReturn`이 중복 호출되어도 Web 함수에 파라미터가 전달되지 않습니다.

### ***Error Interface***
`FlexReject`객체를 리턴한다면, Web에 오류 발생 사항을 전달할 수 있습니다.  
```swift
// in swift
flexComponent.setInterface("errorTest")
{ arguments -> Any? in
    return FlexReject("errorTest")    
}
```
```js
// in js
...
try {
    const result = await $flex.errorTest();
} catch(e) {
    // e is Error("errorTest")
}
```
`FlexAction`에서는, `promiseReturn`대신 `reject`함수를 호출하여 손쉽게 에러사항을 전달할 수 있습니다.  
```swift
// in swift
flexComponent.setAction("errorAction")
{ (action, arguments) -> Any? in
    action.reject("errorAction") // = action.promiseReturn(FlexReject("errorAction"))
}
```
```js
// in js
...
try {
    const result = await $flex.errorAction();
} catch(e) {
    // e is Error("errorAction")
}
```

## NativeToWeb 인터페이스
NativeToWeb 인터페이스는 다음의 특징을 지닙니다.
1. Web의 $flex.web Object 안에 함수를 추가하면, Native(FlexWebView, FlexComponent)에서 `evalFlexFunc` 메소드를 통해 해당 함수를 호출할 수 있습니다.
2. window.onFlexLoad 호출 후($flex 생성 후) $flex.web에 함수 추가가 가능합니다.
3. $flex.web 함수는, 일반 return 및 Promise return을 통해 Native에 값을 전달 할 수 있습니다.

```js
window.onFlexLoad = () => {
    $flex.web.webFunc = (data) => {
        // data is ["data1","data2"]
        return data[0]; // "data1"
    }
    $flex.web.Retrun = () => {
        return Promise.resolve("this is promise")
    }
}
```
```swift
...
// call function, send data, get response
mFlexWebView.evalFlexFunc("webFunc",["data1","data2"]) // same as $flex.web.webFunc(["data1","data2"])
{ res -> Void in
    // res is "data1"
}
component.evalFlexFunc("Retrun") // same as $flex.web.Retrun()
{ res -> Void in
    // res is "this is promise"
}
// just call function
component.evalFlexFunc("Retrun")
// call function and send data
mFlexWebView.evalFlexFunc("webFunc",["data1","data2"])
```

# Native Class 
FlexWebView를 비롯한 프레임워크의 Native class를 설명합니다.
## FlexWebView
FlexWebView는 다음의 특징을 지닙니다.
1. WKWebView 상속하여 제작되었습니다.
2. 비동기 인터페이스를 위해선 FlexComponent를 사용해야 합니다. FlexComponent는 WKWebViewConfiguration를 포함하고 있습니다.
3. 기존 WKWebView의 userContentController와 혼용하여 사용할 수 있습니다. (이 경우, $flex를 사용한 Promise pattern interface 사용 불가.)
4. evalFlexFunc 메소드를 통해, $flex.web 안의 함수들을 호출할 수 있습니다.

### FlexWebView 구성요소
아래 구성 요소를 제외하면, WKWebView와 동일합니다.
```swift
let component: FlexComponent // readOnly
var parentViewController: UIViewController? // readOnly
init (frame: CGRect, configuration: WKWebViewConfiguration) 
init (frame: CGRect, component: FlexComponent)
func evalFlexFunc(_ funcName: String)
func evalFlexFunc(_ funcName: String, _ returnAs: @escaping (_ data: Any?) -> Void)
func evalFlexFunc(_ funcName: String, sendData: Any)
func evalFlexFunc(_ funcName: String, sendData: Any, _ returnAs: @escaping (_ data: Any?) -> Void)
```
evalFlexFunc 사용법은 [NativeToWeb 인터페이스](#NativeToWeb-인터페이스)를 참조하세요.

## FlexComponent
FlexComponent는 WKWebViewConfiguration를 대체하며, 다음의 특징을 지닙니다.
1. WKWebViewConfiguration를 포함하고 있으며, FlexComponent의 WKWebViewConfiguration는 FlexWebView에 적용됩니다.
2. setInterface, setAction을 통해 FlexWebView에 Native 와 Web간의 비동기 인터페이스를 추가합니다.
3. BaseUrl을 설정하여, 지정된 페이지에서만 네이티브와 인터페이스 하도록 설정할 수 있습니다.
4. $flex Object에 여러 설정값을 추가 할 수 있습니다.

### BaseUrl 설정
설정한 BaseUrl이 포함된 Page에서만 $flex Object 사용이 가능합니다.  
BaseUrl을 설정하지 않으면, 모든 페이지에서 $flex Object를 사용할 수 있습니다.  
한번 설정한 BaseUrl은 다시 수정할 수 없습니다.
```swift
func setBaseUrl(_ url: String)
var BaseUrl: String? // readOnly
```

### InterfaceTimeout
FlexInterface가 실행된 후, return이 발생할 때 까지 기다리는 시간을 설정합니다.  
해당 시간이 지나면, 인터페이스로 생성된 Promise는 강제 reject 처리됩니다.
```swift
func setInterfaceTimeout(_ timeout: Int)
```

### WebToNative Interface Setting
FlexWebView에 인터페이스를 추가합니다.  
상세한 사항은 [WebToNavite 인터페이스](#WebToNative-인터페이스) 항목을 참고하세요.
```swift
func setInterface(_ name: String, _ action: @escaping (_ arguments: Array<Any?>?) -> Any?)
func setAction(_ name: String, _ action: @escaping (_ action: FlexAction, _ arguments: Array<Any?>?) -> Void?)
```

### call NativeToWeb Interface
NativeToWeb 인터페이스를 호출합니다.
```swift
func evalFlexFunc(_ funcName: String)
func evalFlexFunc(_ funcName: String, _ returnAs: @escaping (_ data: Any?) -> Void)
func evalFlexFunc(_ funcName: String, sendData: Any)
func evalFlexFunc(_ funcName: String, sendData: Any, _ returnAs: @escaping (_ data: Any?) -> Void)
```
evalFlexFunc 사용법은 [NativeToWeb 인터페이스](#NativeToWeb-인터페이스)를 참조하세요.

### 기타 FlexComponent 구성요소
```swift
var FlexWebView: FlexWebView? // readOnly
var configration: WKWebViewConfiguration // readOnly
var parentViewController: UIViewController? // readOnly
```

## FlexAction
setAction로 추가된 WebToNative 인터페이스가 호출될 시 생성됩니다.  
사용 가능한 메소드는 아래와 같으며, promiseReturn 함수만 Web으로 return값을 전달하는 역할을 합니다.  
resolveVoid는 nil 값을 전달하며(promiseReturn(nil)과 동일)  
reject함수는 FlexReject 객체를 자동으로 생성하여 전달합니다.(promiseReturn(FlexReject)와 동일)
```swift
func promiseReturn(_ response: Any?)
func resolveVoid()
func reject(reason: FlexReject)
func reject(reason: String)
func reject()
```
위 함수중 하나라도 호출했다면, 다음에 어떤 함수를 호출하더라도 Web에 값이 전달되지 않습니다.
FlexAction Class를 직접 생성 및 사용하면 아무런 효과도 얻을 수 없으며, 오직 인터페이스상에서 생성되어 전달되는 FlexAction만이 효력을 가집니다.

# $flex Object
\$flex Object는 FlexWebView를 와 Promise 형태로 상호간 인터페이스가 구성되어있는 객체입니다.  
$flex Object는 [Android FlexHybridApp](https://github.com/Kyun-J/FlexHybridApp-Android)에 적용될 때와 동일한 코드로 사용할 수 있습니다.  
$flex Object의 구성 요소는 다음과 같습니다.
```js
window.onFlexLoad // Called after the $flex load completes. When overriding onFlexLoad, the overridden function is called immediately.
$flex // Object that contains functions that can call Native area as WebToNative
$flex.version // get Library version
$flex.web // Object used to add and use functions to be used for NativeToWeb
$flex.device // Currnet Device Info
$flex.isAndroid // false
$flex.isiOS // true
```
상세한 사용법은 [Flex 인터페이스 구현](#Flex-인터페이스-구현) 항목을 참고하세요.
