;


(function (window,document) {
    function myQuery(selector) {
        if(typeof selector == 'function'){
            window.addEventListener('load',function () {
                selector();
            });

/*            //方式一：是DOM0 事件。 这种情况下只能添加一次，如果要添加多次，则后面的会覆盖前面的，因此不能使用这种方法去添加
            window.onload = function () {
                selector();
            }*/
        }else {
            return new init(selector);
        }

    }
    myQuery.get = function (url, onSuccess) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',url,true);
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4){
                if(xhr.status == 200 || xhr.status == 304){
                    //调用回调函数，把响应数据传回给回调函数的声明的位置
                    if(typeof onSuccess == 'function'){
                        onSuccess(xhr.responseText,xhr);
                    }
                }else{

                }
            }
        };
        xhr.send(null);
    };


    // 当做 构造函数 来用
    /*增加功能： 当传入的是一个元素也可以使用这个库，不仅仅限于传入的是个选择器 。*/
    function init(selector) {
        //当传给进来一个选择器的时候，将这个选择器获得转为js使用的标签元素
        //这里的this 指的是将来要创建的这个 对象     ，这里指的是传入的实参div
        if(typeof selector == 'string'){// 如果是字符串就是选择器
            this.ele = document.querySelector(selector);
        }else if(typeof selector == 'object'){
            this.ele = selector;
        }
    }
    //init()方法的原型替换  ， 在init()方法上新的原型上 添加tap方法
    init.prototype = {
        tap:function (callBack) {
            //判断传入的回调函数是否是个函数
            if(typeof callBack != 'function') return this;
            // console.log('tap');

            // 写业务逻辑  ,这里写  tap轻点
            var ele = this.ele;
            ele.addEventListener('touchstart',handler);
            ele.addEventListener('touchend',handler);
            var startTime;

            function handler(event) {
                var type = event.type;
                var touch = event.changedTouches[0];
                if (type == "touchstart"){
                    startTime = new Date();
                }else{
                    var deltaTime = new Date() - startTime;
                    if (deltaTime < 200){
                        callBack.call(ele, {
                            type: "tap",
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            initEvent:event
                        });
                    }
                }

            }
            return this;//为了链式调用做准备

        },
        //第十二步：添加pan方法
        pan:function (callBack) {
            if(typeof callBack != 'function') return this;
            var ele = this.ele;
            ele.addEventListener('touchstart',handler);
            ele.addEventListener('touchmove',handler);
            ele.addEventListener('touchend',handler);
            var startX = 0, startY = 0, deltaX = 0, deltaY = 0;
            /*3.1  声明一个变量lastTime记录每次开始的时间。声明变量lastDeltaX = 0, lastDeltaY = 0存储当前结束的距离差，为下一次开始，计算下一次距离差做准备。声明变量 speedX, speedY元素随手指运动的速度，x轴方向和y轴方向的速度。*/
            var lastTime = new Date(), lastDeltaX = 0, lastDeltaY = 0, speedX = 0, speedY = 0;
            function handler(event) {
                var touch = event.changedTouches[0];
                var type = event.type;
                if(type == 'touchstart'){
                    // 每次点击事件开始的时候, 都要把值给复原
                    deltaX = 0;
                    deltaY = 0;
                    speedX = 0;
                    speedY = 0;

                    startX = touch.clientX;
                    startY = touch.clientY;
                    lastTime = new Date();
                    callBack.call(ele, {
                        type: "panstart",
                        start: true,
                        deltaX: 0,
                        deltaY: 0,
                        speedX: 0,
                        speedY: 0
                    });

                }else if(type == 'touchmove'){
                    deltaX = touch.clientX - startX;
                    deltaY = touch.clientY - startY;
                    /*计算手指允许速度*/
                    var currentTime = new Date();//3.3  当手指移动的时候（移动中或移动结束），记录一下当前时间
                    // console.log(currentTime);//可以查看当前实时时间
                    var deltaTime = currentTime - lastTime;//3.4  计算当前的时间差  //从点击到拖动到抬起手指这个过程的时间长度 ， 时间差
                    //3.7  计算手指允许速度   。    deltaX - lastDeltaX  计算的是手指前后两次移动的距离差   ，  deltaTime/1000  手指前后两次移动的时间差
                    speedX = (deltaX - lastDeltaX) / (deltaTime/1000);
                    speedY = (deltaY - lastDeltaY) / (deltaTime/1000);

                    callBack.call(ele,{
                        type: "panmove",
                        deltaX:deltaX,
                        deltaY:deltaY,
                        speedX:speedX,
                        speedY:speedY
                    });


                    //3.5  保存当前此次手指移动的距离差（x轴方向的距离 和 y轴方向的距离） ，为下一次移动后计算speed做准备
                    lastDeltaX = deltaX;
                    lastDeltaY = deltaY;
                    lastTime = currentTime;//3.6 保存当前此次 当手指移动的时候（移动中或移动结束），记录一下当前时间，为下一次计算deltaTime 做准备，从而为下一次移动后计算speed做准备

                }else {
                    //end告诉库的使用者, pan事件结束了 .    用来判断 滑动结束的状态
                    callBack.call(ele,{
                        type: "panmove",
                        deltaX:deltaX,
                        deltaY:deltaY,
                        speedX:speedX,
                        speedY:speedY,
                        end:true
                    });
                }

            }
            return this;
        },
        //自定义滚动条（第一部分：滚动条静态样式）
        scrollBar:function (color,width) {
            var ele = this.ele;
            var parent = this.ele.parentElement;
            /*要先判断子元素的高度是否大于父元素的高度，如果大于就创建span滚动条，如果小于或等于就不需要滚动条，不进行后面逻辑 */
            if(ele.offsetHeight <= parent.offsetHeight) return;
            if(getCssValue(parent, 'position') == 'static'){
                parent.style.position = 'relative';
            }

            /*优化代码*/
            var span = document.getElementById('bar');
            if(span){
                var style = span.style;
                style.height = parent.offsetHeight * parent.offsetHeight / ele.offsetHeight +'px';
            }else {
                span = document.createElement('span');
                span.id = 'bar';
                var style = span.style;
                style.width = width + 'px';
                style.height = parent.offsetHeight * parent.offsetHeight / ele.offsetHeight +'px';
                style.backgroundColor = color;

                style.position = 'absolute';/*这里span要绝对定位，因此首先一定要先判断他的父容器是否有定位，这里我们通过  getCssValue(parent, 'position')返回值是 属性position的值 判断*/
                style.right = '2px';
                style.top = '0px';
                style.borderRadius = width / 2 + 'px';

                style.opacity = '0';//注释掉 是 /*测试滚动条是否添加成功*/
                // style.transition = 'opacity 1s';

                ele.parentElement.insertBefore(span,ele.nextElementSibling);// 这里用的是原生（不是jQuery）,把span插入到他的下一个兄弟的前面，（主要是插入到wrap的后面）

            }
            return this;
        },
        // 第十四步：自定义滚动条（第二部分：滚动条逻辑）
        scroll:function (d1,scrolling) {
            //d1  :  wrap 滚动的距离 initY+deltaY      ,使用者传入
            // wrap滚动的距离 / （wrap的高度 - 视口高度） =  滚动条滚动的距离 /  （视口高度 - 滚动条高度）
            //求 ： 滚动条滚动的距离 d2
            var ele = this.ele;
            //滚动条滚动的时候显示
            var bar = ele.nextElementSibling;

            if (scrolling){
                bar.style.transition = "opacity 1s";
            }else{
                bar.style.transition = "opacity 1s 0.5s";
            }
            //那如何判断何时是滚动状态？
            bar.style.opacity = scrolling ? '1' : '0';
            var parent = ele.parentElement;
            var max1 = ele.offsetHeight - parent.offsetHeight;
            var max2 = parent.offsetHeight - bar.offsetHeight;
            var d2 = -d1 * max2 / max1 ;

            //限定滚动条移动范围
            d2 = d2 <= 0 ? 0 : d2;
            d2 = d2 >= max2 ? max2 : d2;

            bar.style.transform = 'translateY('+ d2 +'px)';

            // return this;
        },
        /**
         *  设置3d变换, 传递的参数, 3个都必须传
         */
        transform: function (name, v1 = 0, v2 = 0, v3 = 0){
            name = name.toLowerCase();
            var ele = this.ele;
            if (name == "translate3d"){
                ele.style.transform = "translate3d(" + v1 + "px," + v2 + "px," + v3 + "px)";
            }else if (name == "rotatex"){
                ele.style.transform = "rotateX(" + v1 + "deg)";
            }else if (name == "rotatey"){
                ele.style.transform = "rotateY(" + v1 + "deg)";
            }else if (name == "rotatez" || name == "rotate"){
                ele.style.transform = "rotateZ(" + v1 + "deg)";
            }else if (name == "scale3d"){
                ele.style.transform = "scale3d(" + v1 + "," + v2 + "," + v3 + ")";
            }
            return this;
        },
        // toggle  切换功能    show显示     hide 隐藏
        toggle:function () {
            //获取此时元素的 display属性的值
            // var display = this.ele.display ;//这样获取到的时行内样式的这个元素的display 属性的属性值 ，第一次拿到的这样的行内样式的值有可能获取不到，因为一开始可能元素还没有这个属性
            var display = window.getComputedStyle(this.ele, null)['display'];//这样获取的是通过计算后，才是当前作用的属性的值，不管是行内样式还是内部或外部样式，
            if(display ==  'block'){
                this.hide();
            }else if(display ==  'none'){
                this.show();
            }
            return this;
        },
        show:function () {
            this.ele.style.display = 'block';
            return this;
        },
        hide:function () {
            this.ele.style.display = 'none';
            return this;
        },
        /* 获取 transform: translate(x, y, z); 中的 x 的值 。这里获取的时库里封装的transform 3d功能（设置3d变换，传递的参数，）这个transform的x轴方向的偏移量 。
        * 获取这个元素的  transform: translate 的 x 轴的 偏移量（值）*/
        /*方法一：
        *
        * 全屏滑动广告轮播图
        function lbt() {
        var initX;
        $('.spiders').pan(function (event) {
            if(event.start){
                initX =this.style.transform;// 返回值   translate3d(0px, 0px, 0px)
                console.log('初始获取的transform的属性的属性值：' + initX);//
            }

            $(this).transform('translate3d',event.deltaX);
            initX =this.style.transform;
            console.log(initX);
        });
    }


    在js中 写  initX =this.style.transform;// 返回值   translate3d(0px, 0px, 0px) ，可以正常获取到需要的数据的。
    问题：在myQuery4.js库 中封装 dx方法的时候，如何通过正则表达式或可以使用正则的字符串方法去获取取 transform: translate(x, y, z); 中的 x 的值 。

*  */

        /*方法二：
        *
        * 背景：
        * 全屏滑动广告轮播图
        function lbt() {
        var initX;
        $('.spiders').pan(function (event) {
            if(event.start){
                initX = window.getComputedStyle(this,null)[transform];//报错
                console.log('初始获取的transform的属性的属性值：' + initX);
                initX = $(this).tx();
            }

            $(this).transform('translate3d',event.deltaX+initX);
            // if(event) initX += event.deltaX;
            initX =this.style.transform;
            console.log(initX);
        });
        存在问题，在js中 写  initX = window.getComputedStyle(this,null)[transform];//报错，获取不到需要的数据的

    }*/
        /*获取这个元素的translateX的值*/
        tx : function (){
            var m = window.getComputedStyle(this.ele, null)["transform"];/*得到一个矩阵*/
            var arr = m.split(",");/*得到一个字符串*/
            return +arr[arr.length - 2];/*获得数字*/
        },
        /*获取这个元素的translateY的值*/
        ty : function (){
            var m = window.getComputedStyle(this.ele, null)["transform"];/*得到一个矩阵*/
            var arr = m.split(",");/*得到一个字符串*/
            return +arr[arr.length -1].replace(")", "") || 0;/*获得数字*/
        },
        /*过渡。 设置或获取transition的值*/
        transition:function (value) {
            if(typeof value == "undefined"){
                return window.getComputedStyle(this.ele,null)["transition"];
            }else {
                this.ele.style.transition = value;
                return this;
            }
        },
        /*多点触摸事件_缩放（封装缩放方法）*/
        //注意：这里的scale的属性值  ，是指的是这一次的缩放动作的缩放倍数，不是累加结果的缩放倍数。也就是说一次完成的触摸屏幕开始，移动到结束的过程之间的放大或缩小的倍数，而不是几次这样完整过程的缩放倍数的累加结果。
        scale:function (callBack) {
            var ele = this.ele;
            ele.addEventListener('touchstart',handler);
            ele.addEventListener('touchmove',handler);
            ele.addEventListener('touchend',handler);

            function handler(event) {
                var type = event.type;
                var touchs = event.targetTouches;

                var startDis;
                var startScale = 1;

                if(touchs.length == 2){
                    if(type == 'touchstart'){
                        startDis = dis(touchs);
                        callBack.call(ele,{
                            type:'scalestart',
                            scale:1
                        });
                    }else if(type == 'touchmove'){
                        scale = dis(touchs) / startDis ;
                        callBack.call(ele,{
                            type:'scaling',
                            scale:scale
                        });
                    }
                }else if(touchs.length == 1){
                    if(type == 'touchend'){
                        callBack.call(ele,{
                            type:'scaleend',
                            scale:scale
                        });
                    }
                }
            }

            return this;
        },
        /* 点触摸事件-旋转rotate(封装旋转)*/
        rotate:function (callBack) {
            var ele = this.ele;
            ele.addEventListener('touchstart',handler);
            ele.addEventListener('touchmove',handler);
            ele.addEventListener('touchend',handler);

            function handler(event) {
                var type = event.type;
                var touchs = event.targetTouches;

                var startDeg, deltaDeg;

                if(touchs.length == 2){
                    if(type == 'touchstart'){
                        startDeg = getDeg(touchs);
                        callBack.call(ele,{
                            type:'rotatestart',
                            deltaDeg:0
                        });
                    }else if(type == 'touchmove'){
                        deltaDeg = getDeg(touchs) - startDeg ;
                        callBack.call(ele,{
                            type:'rotating',
                            deltaDeg:deltaDeg
                        });
                    }
                }else if(touchs.length == 1){
                    if(type == 'touchend'){
                        callBack.call(ele,{
                            type:'rotateend',
                            deltaDeg:deltaDeg
                        });
                    }
                }
            }

            return this;
        }

    };
    //第二步：// 给window注册两个变量       //给window 添加 $方法（对象）（函数）
    window.$ = window.myQuery = myQuery;

    /*获取指定的css的值   。 滚动条，用来判断span的父元素是否已经定位 */
    function getCssValue(ele, name) {
        return window.getComputedStyle(ele,null)[name];
    }

    /*计算两个点之间的距离*/
    function dis(touchs) {
        // return Math.hypot(touchs[0].clientX - touchs[1].clientX, touchs[0].clientY - touchs[1].clientY);
        return Math.sqrt((touchs[0].clientX - touchs[1].clientX) ** 2 + (touchs[0].clientY - touchs[1].clientY) ** 2);
    }

    /*计算touches中前两个touch连成的直线与x轴的夹角  (角度)*/
    function getDeg(touchs) {
        var t1 = touchs[0];
        var t2 = touchs[1];
        // 反正切函数的值域是[Math.PI/2, -Math.PI/2]
        var rad = Math.atan((t2.clientY - t1.clientY)/(t2.clientX - t1.clientX));//获得的是弧度单位的
        // 反正切函数的值域是 [90°, -90°]
        return rad / Math.PI * 180 ;
    }



})(window,document);//给传入实参，window,document方便系统查找速度