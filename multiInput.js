(function() {
    function MultiInput(className, config) {
        // item的个数，最多五个
        this.itemNum = 1;
        this.MI_box = $("." + className);
        // 添加按钮
        this.addBtn = null;
        // select选项列表
        this.optionsList = config.optionsList || [];
        // 选中的value列表，用于保证一组item中的select不能选择重复的value
        this.optionSelectedList = [];
        // 用于保证每个item中select和input的name属性不一致
        this.itemId = 0;
        // input 总和改变的回调事件
        this.inputsSumChangeCB = config.inputsSumChangeCB;
        // select选择重复的回调事件
        this.selectRepeatCB = config.selectRepeatCB;
        this.defaultData = config.defaultData;
        this.init();
    }

    MultiInput.prototype = {
        constructor: MultiInput,
        init: function() {
            var that = this;
            // 初始化第一个item
            this.MI_box.append(this.getAddItem());
            for (var i = 0; i < 4; i++) {
                this.MI_box.append(this.getReduceItem());
            }
            // 初始化添加按钮
            this.addBtn = this.MI_box.find(".MI-add-btn");

            // 添加按钮注册事件
            this.MI_box.on("click", ".MI-add-btn", function() {
                that.addBtnHandle();
            });

            // 删除按钮注册事件
            this.MI_box.on("click", ".MI-reduce-btn", function() {
                that.reduceBtnHandle($(this));
            });

            // select change事件
            this.MI_box.on("change", "select", function() {
                if (that.optionSelectedList.indexOf($(this).val()) > -1) {
                    that.selectRepeatCB();
                    $(this)
                        .find("option:eq(0)")
                        .prop("selected", true);
                }
                var list = [];
                $.each(that.MI_box.find("select"), function(idx, select) {
                    // select 空时不算重复
                    if ($(select).val() === "") {
                        return;
                    }
                    list.push($(select).val());
                });
                that.optionSelectedList = list;
            });
            // select change事件
            this.MI_box.on("blur", "input", function() {
                that.inputsSumChangeCB(that.getInputsSum());
            });
            // 初始化默认数据
            this.initData();
            that.inputsSumChangeCB(that.getInputsSum());
        },
        // 获取添加item的dom结构(带加号的item)
        getAddItem: function() {
            var optionsDomList = [];
            this.optionsList.forEach(function(item) {
                optionsDomList.push(
                    '<option value="' +
                        item.value +
                        '">' +
                        item.text +
                        "</option>"
                );
            });
            return $(
                ' <div class="MI_item clearfix"> \
                                    <div class="MI_select_box"> \
                                        <select class="MI_select form-control" name="MI-select-' +
                    this.itemId +
                    '"> \
                                <option value="">select</option> \
                                ' +
                    optionsDomList.join("\n") +
                    '\
                            </select> \
                        </div> \
                        <div class="MI_input_box"> \
                            <input class="MI_input form-control" name="MI-input-' +
                    this.itemId +
                    '" type="text" value="0"> \
                        </div> \
                        <div class="MI_btn_box"> \
                            <div class="MI_btn MI-btn MI-add-btn">+</div> \
                        </div> \
                    </div> \
                    '
            );
        },

        // 获取删除item的dom结构(带减号的item)
        getReduceItem: function() {
            var optionsDomList = [];
            this.optionsList.forEach(function(item) {
                optionsDomList.push(
                    '<option value="' +
                        item.value +
                        '">' +
                        item.text +
                        "</option>"
                );
            });
            this.itemId++;
            return $(
                ' <div class="MI_item clearfix hide"> \
                                    <div class="MI_select_box"> \
                                        <select class="MI_select form-control" name="MI-select-' +
                    this.itemId +
                    '"> \
                                <option value="">select</option> \
                                ' +
                    optionsDomList.join("\n") +
                    '\
                            </select> \
                        </div> \
                        <div class="MI_input_box"> \
                            <input class="MI_input form-control" name="MI-input-' +
                    this.itemId +
                    '" type="text" value="0"> \
                        </div> \
                        <div class="MI_btn_box"> \
                            <div class="MI_btn MI-btn MI-reduce-btn">-</div> \
                        </div> \
                    </div> \
                    '
            );
        },

        // 添加按钮的操作
        addBtnHandle: function() {
            // 添加隐藏的第一个item到最后;
            this.operItemNum("add");
            var cloneItem = this.MI_box.find(".MI_item.hide:first").clone(true);
            this.MI_box.find(".MI_item.hide:first").remove();
            this.MI_box.append(cloneItem.removeClass("hide"));
        },

        // 删除按钮的操作
        reduceBtnHandle: function(thisBtn) {
            this.operItemNum("reduce");
            thisBtn
                .parents(".MI_item")
                .addClass("hide")
                .find("select,input")
                .val("");
            this.inputsSumChangeCB(this.getInputsSum());
        },

        // 操作并监控item数量，最多5个item，否则addBtn失效
        operItemNum: function(flag) {
            if (flag === "add") {
                this.itemNum++;
            } else {
                this.itemNum--;
            }
            if (this.itemNum === 5) {
                // btn失效
                this.addBtn.toggleClass("hide MI-add-btn");
            } else {
                // btn生效
                if (!this.addBtn.hasClass("MI-add-btn")) {
                    this.addBtn.toggleClass("hide MI-add-btn");
                }
            }
        },
        // 获取所有input value的和
        getInputsSum: function() {
            var sum = 0;
            this.MI_box.find("input").each(function(idx, input) {
                if ($(input).val() !== "") {
                    sum += parseFloat($(input).val());
                }
            });
            return sum.toFixed(2);
        },
        // 格式化插件填写的数据，用于提交给后台，格式如下
        // selectVal1,inputVal1;selectVal2,inputVal2;selectVal3,inputVal3;
        getData: function() {
            dataArray = [];
            this.MI_box.find(".MI_item").each(function(idx, item) {
                // 隐藏的item不收集数据
                if ($(item).hasClass("hide")) {
                    return;
                }
                var selectVal = $(item)
                    .find("select")
                    .val();
                var inputVal = $(item)
                    .find("input")
                    .val();
                dataArray.push(selectVal + "," + inputVal);
            });
            return dataArray.join(";");
        },
        // 初始化回显的数据
        initData: function() {
            var that = this;
            if (typeof that.defaultData === "string") {
                // 没有回显数据，则默认选中当前出金方式
                // defaultData格式：selectText&&inputVal
                var data = this.defaultData.split("&&");

                that.MI_box.find(
                    '.MI_item:eq(0) select option:contains("' + data[0] + '")'
                ).prop("selected", true);
                that.MI_box.find(".MI_item:eq(0) input ").val(data[1]);
                // 更新选中的select值列表
                that.optionSelectedList.push(
                    that.MI_box.find(".MI_item:eq(0) select").val()
                );
            } else {
                // 回显pending的数据
                // defaultData格式：[{selected:1,inputVal:3},{selected:4,inputVal:3}，{selected:6,inputVal:3}]
                that.itemNum = 0;
                $.each(that.defaultData, function(idx, data) {
                    that.MI_box.find(".MI_item:eq(" + idx + ")")
                        .removeClass("hide")
                        .find("select option:eq(" + data.selected + ")")
                        .prop("selected", true)
                        .end()
                        .find("input")
                        .val(data.inputVal);

                    // 更新选中的select值列表
                    that.optionSelectedList.push(data.selected);
                    // 更新item个数
                    that.operItemNum("add");
                });
            }
        }
    };
    window.MultiInput = MultiInput;
})($);
