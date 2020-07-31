
;

/*禁止全局默认行为 。   rem适配*/
$(function () {
    var wrap = document.querySelector('.wrap');
    wrap.addEventListener('touchstart',function (event) {
        event.preventDefault;
    });


    var designWidth = 750;
    size = document.documentElement.clientWidth / (designWidth/100);
    document.documentElement.style.fontSize = size + 'px';
    document.body.style.fontSize = '14px';

});


$(function () {

    var hiddenLi = document.querySelector('.img_list .hidden');
    var imgList = document.querySelector('.img_list');

    getData(1, dataLoadSuccess);


    /*通过ajax 获取数据*/
    function getData(pageNumber, callBack) {
        $.get('data/'+pageNumber+'.json', callBack);
    }

    /*数据加载成功之后的回调*/
    function dataLoadSuccess(data,xhr) {
        //获取json数据， 通过 JSON.parse(data) 获取的到的是一个数组，数据存在数组中
        var arr = JSON.parse(data);

        //遍历数组，获取图片路径,克隆 li ,动态生成 li .
        for(var name of arr){//有多少个数据就复制多少个li给这些li添加属性item,
            //克隆li ，深度克隆，包括他的子孙节点
            var li = hiddenLi.cloneNode(true);
            li.classList.remove('hidden');
            li.classList.add('item');
            li.firstElementChild.src = 'img/'+ name ;//原生js
            imgList.appendChild(li);
            li.firstElementChild.onload = function () {
                $(this).transition('opacity 1s');
                this.style.opacity = '1';
            }
        }

        /*图片加载完成之后添加滚动条*/
        /*添加滚动条*/
        addScrollBar();

    }


    /*给 img_list来添加滚动条*/
    function addScrollBar(){
        $('.main').scrollBar('#d300ff', 6);/*绑定的是main*/
    }


    addPanToMain();
    /*给main添加滑动事件*/
    function addPanToMain(){
        var initY;
        // console.log($('.main'));
        $('.main').pan(function (event){
            if(event.start){
                $(this).transition('');
                initY = $(this).ty();
                // console.log(initY);
            }
            $(this).transform('translate3d', 0, event.deltaY + initY);
            $(this).scroll(event.deltaY + initY, true);
            if(event.end){
                var ty = $(this).ty();
                $(this).scroll(ty, false);
                /*向上滚动的时候最大的滚动的距离*/
                var minTy = this.offsetHeight - this.parentElement.offsetHeight;

                if(ty >= 0){
                    ty = 0;
                    $(this).transition('transform 0.4s');
                    $(this).transform('translate3d', 0, ty);

                    downRefresh();//下拉刷新
                }else if(ty <= -minTy +60){
                    ty = -minTy;
                    $(this).transition('transform 0.4s');
                    $(this).transform('translate3d', 0, ty);

                    /*加载更多*/
                    logMore();

                }
            }
        })
    }

    /*加载更多*/
    /*上拉，松开手加载更多*/
    var currentPage = 1;//默认加载第一份数据
    function logMore() {
        /*松开手的时候更新文本内容*/
        var span = document.querySelector('.more>span');
        span.innerHTML = '正在努力加载...';

        currentPage++;
        currentPage = currentPage == 6 ? 1 : currentPage;//因为这里的数据共是6份，这里为了避免后面加载到第六份数据之后，要加载第七份数据的时候因为不存在第七份数据，会报错，所以这里对currentPage做了个判断，限制，让他循环加载这六份数据。
        getData(currentPage,dataLoadSuccess);
    }

    /*
    实现效果：
    一上来页面正在加载的时候，默认的时候显示文本‘正在努力加载...’，
    当加载完成之后，拖动内容到页面底部的时候再上拉更新的时候（没有松开手）应该显示文本为‘松开加载更多...’的字眼，
    最后，当松开手的时候显示文本‘正在努力加载...’。

    */
    loadMoreInfo();
    /*加载更多的时候显示的信息的提示的切换*/
    function loadMoreInfo() {
        var span = document.querySelector('.more>span');
        $('.main').pan(function (event) {
            if(event.start){
                span.innerHTML = '松开加载更多...';
            }
        });
    }



    /*下拉刷新*/
    /*实际应用上，数据时更新的，每次打开的数据可能不一样，需要做一个下拉刷新的意义所在。这里我们用随机生成数字对应的json数据的来模拟更新的数据。*/
    function downRefresh() {
        /*下拉刷新的时候，把旧的（刷新之前）的数据全部清空*/
        document.querySelector('.img_list').innerHTML = '';
        document.querySelector('.more>span').innerHTML = '正在努力加载...';

        currentPage = randomInt(1,5);
        getData(currentPage, dataLoadSuccess);
    }

    /*生成随机数*/
    function randomInt(from, to) {
        return parseInt(Math.random() * (to - from +1) + from);
    }



    /*处理放大效果*/
    big();
    function big() {
        var big = document.querySelector('.big');
        var canvas = document.querySelector('canvas');

        var ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;

        $('.img_list').tap(function (event) {
            $(big).transform('scale3d', 1, 1, 1);

            // console.log(event);
            var target = event.initEvent.target;

            /*确定点击图片的缩放参考中心点*/
            var rect = target.getBoundingClientRect();
            var centerX = rect.left + rect.width / 2 ,
                centerY = rect.top + rect.height / 2 ;
            big.style.transformOrigin = centerX + 'px  ' + centerY + 'px';

            // console.log(target);
            ctx.drawImage(target, 0 , 0, canvas.width, canvas.height);

        });

        $('.close').tap(function (event) {
            $(big).transform('scale3d', 0, 0, 1);
        });




        /*
        第二步处理：
            解决第一步存在问题。

        第一步处理：此种方式存在问题  ：存在问题：此时代码既可以旋转也可以缩放（在旋转的基础之后也可以缩放），问题是每次（一次完整的操作旋转缩放）都是从头开始，不是在当前的状态下进行下一次的操作。*/

        /*  给canvas增加旋转和缩放的功能  */

        var initScale =1;
        var initDeg = 0;

        /*要判断处此处的目的是在做缩放还是做旋转*/
        var wantScale = false;//默认情况没有做缩放
        var wantRotate = false;//默认情况下没有做旋转
        /*监视缩放的倍数，超过1.1倍就认为是在放大  。   监视旋转的角度，旋转角度差绝对值超过10°就认为是在做旋转 。*/

        var stringScale = 'scale(1)';//缩放字符串，存储transform的属性值
        var stringRotate = 'rotate(0deg)';//旋转字符串，存储transform的属性值

        $(canvas).scale(function (event) {
            var scale = event.scale;
            //判断一下当前缩放倍数 //为了识别用户操作：是放大还是旋转
            //1.1倍
            if(scale >= 1.1 || scale <= 0.9){
                wantScale = true;
            }

            //当结束的时候，对initScale做一下变化保存当前此次执行的缩放倍数   。  wantScale 变回初始值：没有进行缩放，处于自然状态。
            if(event.type == 'scaleend'){
                wantScale = false; //一结束缩放就 变成false  //离开的时候，当缩放操作结束的时候，将变量回到初始状态
                initScale *= scale;
            }

            //如果当前状态是：没有做旋转，在做缩放，并且在执行缩放过程中
            if(!wantRotate && wantScale && event.type == 'scaling'){// 只在缩放过程中执行
                wantScale = 'scale('+  scale * initScale +') ';//留个空格，要进行字符串拼接，要符合格式，例如： transform: scale(4) rotate(30deg);
                this.transform = stringScale + stringRotate;
            }

        }).rotate(function (event) {
            var deg = event.deltaDeg;
            //判断一下当前旋转角度  //为了识别用户操作：是放大还是旋转
            //10°
            if(Math.abs(deg) >= 10){
                wantRotate = true;
            }

            //当结束的时候，对initDeg做一下变化保存当前此次执行的旋转度数   。  wantRotate 变回初始值：没有进行旋转，处于自然状态。
            if(event.type == 'rotateend'){
                wantRotate = false; //一结束旋转就 变成false  //离开的时候，当旋转操作结束的时候，将变量回到初始状态
                initDeg += deg;
            }

            //如果当前状态是：在做旋转，没有做缩放，并且在执行旋转过程中
            if( wantRotate && !wantScale && event.type == 'rotating'){
                stringRotate = 'rotate('+  (deg + initDeg) +') '; //留个空格，要进行字符串拼接，要符合格式，例如： transform: scale(4) rotate(30deg);
                this.transform = stringRotate + stringScale;
            }

    });

    }

});