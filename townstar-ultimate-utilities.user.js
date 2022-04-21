// ==UserScript==
// @name         Townstar ultimate utilities
// @namespace    http://tampermonkey.net/
// @version      0.1.7
// @updateURL    https://tzanou123.github.io/js/townstar-ultimate-utilities.user.js
// @downloadURL    https://tzanou123.github.io/js/townstar-ultimate-utilities.user.js
// @description  A script for the town star gala game with a lot of features like auto sell a powerfull rate monitor and more ... it come with a pretty and easy to use interfaces
// @author       Tzanou
// @match        *://*.sandbox-games.com/*
// @require    https://code.jquery.com/jquery-3.6.0.js
// @require    https://code.jquery.com/ui/1.13.1/jquery-ui.js
// @require    https://cdn.rawgit.com/prashantchaudhary/ddslick/master/jquery.ddslick.min.js
// @require    https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.1.0/js/bootstrap-switch.min.js
// @require    https://cdnjs.cloudflare.com/ajax/libs/jquery.dropotron/1.4.3/jquery.dropotron.min.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';
    // trackedItems contain the item tracked for production rateyou dont need to fill it in code !
    // All item crafted go in it directly
    let trackedItems = [];
    // CraftedItems contain the item you want to auto sell you dont need to fill it in code you can add object
    // from the game hud directly.
    // keepAmt is the amount that you do not want to sell
    // sellMin is the minimum amount needed before attempting to sell
    //    setting a sellMin of 100 will ensure that the item is only sold in batches of 100 (e.g. via Freight Ship)
    let craftedItems = [
        // {item: 'Silica', keepAmt: 0, sellMin: 100},
        // {item: 'Pinot_Noir_Grapes', keepAmt: 0, sellMin: 0},
        // {item: 'Feed', keepAmt: 0, sellMin: 0},
        // {item: 'Wheat', keepAmt: 20, sellMin: 0},
        // {item: 'Flour', keepAmt: 0, sellMin: 10},
        // {item: 'Salt', keepAmt: 0, sellMin: 0},
        // {item: 'Sugar', keepAmt: 0, sellMin: 10},
    ]
    let configs = {
        //Change the default production tracker frequency for money
        // Must be day,hour or week value
        // Otherwise the script will crash
        getMoneyRateFrequency: "day",
        //Change the default production tracker frequency for point
        // Must be day,hour or week value
        // Otherwise the script will crash
        getPointRateFrequency: "day",
        keepAmtStepDefault: 1,
        sellMinStepDefault: 1,
    }

    // Uncomment following lin for reseting config
    // GM_setValue('configs', configs)

    console.log("lkdfjslfsdjkfsdjklfhsdjfghsdjkfh", GM_getValue('configs'))
    if(!GM_getValue('configs')) {
        GM_setValue('configs', configs)
    } else {
        configs = GM_getValue('configs')
    }


    const originalCraftedItems = craftedItems;

    const loader = document.createElement('div');

    loader.classList.add('loader');
    loader.classList.add('loader-bouncing');
    loader.classList.add('is-active');
    $(loader).css({
        "position": "absolute",
        "backgroundColor": "rgb(254, 94, 94)",
    })

    const trackedRateItemStoredValue = GM_getValue("trackedRateItem")
    const craftedItemsStoredValue = GM_getValue("craftedItem")
    if (trackedRateItemStoredValue) {
        trackedItems = JSON.parse(trackedRateItemStoredValue)
    }
    if (craftedItemsStoredValue) {
        craftedItems = JSON.parse(craftedItemsStoredValue)
    }

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
    addGlobalStyle('.timeChoose .in_active {background: rgb(254, 94, 94);color: white;border-radius: 3px;}');
    addGlobalStyle('.timeChoose span {padding: 2px;font-size: 10px;margin-right: 8px;cursor: pointer}');
    addGlobalStyle('.trackedItemElem {font-size: 12px}');
    addGlobalStyle('#main-nav ul { list-style: none; margin: 0; padding: 0; }');
    addGlobalStyle('#main-nav ul li { display: inline-block; margin: 0; padding: 0; border-radius: 0.5em; }');
    addGlobalStyle('#main-nav ul li.active { background: #999; }');
    addGlobalStyle('#main-nav ul li.active a { color: #fff; text-decoration: none; }');
    addGlobalStyle('.dropotron { background: #444; border-radius: 0.5em; list-style: none; margin: 0; min-width: 10em; padding: 0.75em 1em 0.75em 1em; }');
    addGlobalStyle('.dropotron > li { border-top: solid 1px #555; margin: 0; padding: 0;padding-top: 10px; }');
    addGlobalStyle('.dropotron > li:first-child { border-top: 0; }');
    addGlobalStyle('.dropotron > li > a { color: #ccc; display: block; padding: 0.5em 0 0.5em 0; text-decoration: none; }');
    addGlobalStyle('.dropotron > li.active > a, .dropotron > li:hover > a { color: #fff; }');
    addGlobalStyle('.dropotron.level-0 { margin-top: 1.25em; }');
    addGlobalStyle('.dropotron.level-0:before { content: ""; position: absolute; border-bottom: solid 0.5em #444; border-left: solid 0.5em transparent; border-right: solid 0.5em transparent; top: -0.5em; }');
    addGlobalStyle('.ui-tooltip {box-shadow:none !important;}');
    //$('head').append('<style>.timeChoose .active {background: rgb(254, 94, 94);color: white;border-radius: 3px;}.timeChoose span {padding: 2px;font-size: 10px;margin-right: 8px;cursor: pointer}</style>');

    var cssNode = document.createElement("link");
    cssNode.setAttribute("rel", "stylesheet");
    cssNode.setAttribute("type", "text/css");
    cssNode.setAttribute("href", 'https://code.jquery.com/ui/1.13.1/themes/ui-lightness/jquery-ui.css');
    document.getElementsByTagName("head")[0].appendChild(cssNode);

    cssNode = document.createElement("link");
    cssNode.setAttribute("rel", "stylesheet");
    cssNode.setAttribute("type", "text/css");
    cssNode.setAttribute("href", 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
    document.getElementsByTagName("head")[0].appendChild(cssNode);

    cssNode = document.createElement("link");
    cssNode.setAttribute("rel", "stylesheet");
    cssNode.setAttribute("type", "text/css");
    cssNode.setAttribute("href", 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.1.0/css/bootstrap2/bootstrap-switch.css');
    document.getElementsByTagName("head")[0].appendChild(cssNode);

    cssNode = document.createElement("link");
    cssNode.setAttribute("rel", "stylesheet");
    cssNode.setAttribute("type", "text/css");
    cssNode.setAttribute("href", 'https://cdnjs.cloudflare.com/ajax/libs/css-loader/3.3.3/css-loader.css');
    document.getElementsByTagName("head")[0].appendChild(cssNode);

    $.fn.animateRotate = function (angle, duration, easing, complete) {
        var args = $.speed(duration, easing, complete);
        var step = args.step;
        return this.each(function (i, e) {
            args.complete = $.proxy(args.complete, e);
            args.step = function (now) {
                $.style(e, 'transform', 'rotate(' + now + 'deg)');
                if (step) return step.apply(e, arguments);
            };

            $({ deg: 0 }).animate({ deg: angle }, args);
        });
    };

    function nFormatter(num, digits) {
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }

    let isAutoSellActivated = true;

    function addIcon({iconClass, classes, tooltip, css, click}) {
        let icon = document.createElement('i');
        if(classes)
            icon.classList.add(classes);
        icon.classList.add('fa-solid');
        icon.classList.add(iconClass);
        if(tooltip)
            $(icon).attr("title", tooltip);
        if(css)
            $(icon).css(css);

        $(icon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });
        if(click)
        $(icon).click(click)
        return icon
    }

    $(document).tooltip();
    function hourChoose(item) {
        let hourChooseMoney = document.createElement('span');
        hourChooseMoney.innerHTML = '1h';
        if(configs.getMoneyRateFrequency == 'hour')
            hourChooseMoney.classList.add('in_active');
        let hourChoosePoint = document.createElement('span');
        hourChoosePoint.innerHTML = '1h';
        if(configs.getPointRateFrequency == 'hour')
            hourChooseMoney.classList.add('in_active');

        let dayChooseMoney = document.createElement('span');
        if(configs.getMoneyRateFrequency == 'day')
            dayChooseMoney.classList.add('in_active');
        dayChooseMoney.innerHTML = '24h';
        let dayChoosePoint = document.createElement('span');
        if(configs.getPointRateFrequency == 'day')
            dayChoosePoint.classList.add('in_active');
        dayChoosePoint.innerHTML = '24h';



        let weekChooseMoney = document.createElement('span');
        weekChooseMoney.innerHTML = '1w';
        if(configs.getMoneyRateFrequency == 'week')
            weekChooseMoney.classList.add('in_active');
        let weekChoosePoint = document.createElement('span');
        if(configs.getPointRateFrequency == 'week')
            weekChoosePoint.classList.add('in_active');

        weekChoosePoint.innerHTML = '1w';

        $(hourChooseMoney).click(function (e) {
            e.stopPropagation();
            if(item) {
                item.moneyRatePicked = 'hour'
                $('#tracked-item-money-' + item.item).html('money: $' + nFormatter(item.oneHourMoney, 2));
                if(item.oneHourMoney <= 0) {
                    $('#tracked-item-money-' + item.item).css("color", "red")
                    $('#tracked-item-money-' + item.item).append(addIcon({
                        iconClass: "fa-circle-info",
                        tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                        css : {
                            "color": "rgb(254 94 94 / 65%)",
                            "fontSize": "14px",
                            "marginLeft": "7px",
                            "position": "relative",
                            "top": "1px",
                        }}))
                } else {
                    $('#tracked-item-money-' + item.item).css("color", "unset")
                }
            } else {
                configs.getMoneyRateFrequency = 'hour'
                GM_setValue('configs', configs)
            }
            
            $(weekChooseMoney).removeClass("in_active")
            $(dayChooseMoney).removeClass("in_active")
            $(hourChooseMoney).addClass("in_active")

        })
        $(hourChoosePoint).click(function (e) {
            e.stopPropagation();
            if(item) {
                item.pointRatePicked = 'hour'
                $('#tracked-item-point-' + item.item).html('points: ' + nFormatter(item.oneHourPoint, 2));
            } else {
                configs.getPointRateFrequency = 'hour'
                GM_setValue('configs', configs)
            }
            
            $(weekChoosePoint).removeClass("in_active")
            $(dayChoosePoint).removeClass("in_active")
            $(hourChoosePoint).addClass("in_active")
        })

        $(dayChooseMoney).click(function (e) {
            e.stopPropagation();
            if(item) {
                item.moneyRatePicked = 'day'
                $('#tracked-item-money-' + item.item).html('money: $' + nFormatter(item.oneDayMoney, 2));
                if(item.oneDayMoney <= 0) {
                    $('#tracked-item-money-' + item.item).css("color", "red")
                    $('#tracked-item-money-' + item.item).append(addIcon({
                        iconClass: "fa-circle-info",
                        tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                        css : {
                            "color": "rgb(254 94 94 / 65%)",
                            "fontSize": "14px",
                            "marginLeft": "7px",
                            "position": "relative",
                            "top": "1px",
                        }}))
                } else {
                    $('#tracked-item-money-' + item.item).css("color", "unset")
                }
            } else {
                configs.getMoneyRateFrequency = 'day'
                GM_setValue('configs', configs)
            }
            
            $(weekChooseMoney).removeClass("in_active")
            $(dayChooseMoney).addClass("in_active")
            $(hourChooseMoney).removeClass("in_active")
        })
        $(dayChoosePoint).click(function (e) {
            e.stopPropagation();
            if(item) {
                item.pointRatePicked = 'day'
                $('#tracked-item-point-' + item.item).html('points: ' + nFormatter(item.oneDayPoint, 2));
            } else {
                configs.getPointRateFrequency = 'day'
                GM_setValue('configs', configs)
            }
            
            $(weekChoosePoint).removeClass("in_active")
            $(dayChoosePoint).addClass("in_active")
            $(hourChoosePoint).removeClass("in_active")
        })

        $(weekChooseMoney).click(function (e) {
            e.stopPropagation();
            if(item) {
                item.moneyRatePicked = 'week'
                $('#tracked-item-money-' + item.item).html('money: $' + nFormatter(item.oneWeekMoney, 2));
                if(item.oneWeekMoney <= 0) {
                    $('#tracked-item-money-' + item.item).css("color", "red")
                    $('#tracked-item-money-' + item.item).append(addIcon({
                        iconClass: "fa-circle-info",
                        tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                        css : {
                            "color": "rgb(254 94 94 / 65%)",
                            "fontSize": "14px",
                            "marginLeft": "7px",
                            "position": "relative",
                            "top": "1px",
                        }}))
                } else {
                    $('#tracked-item-money-' + item.item).css("color", "unset")
                }
            } else {
                configs.getMoneyRateFrequency = 'week'
                GM_setValue('configs', configs)
            }
            
            $(weekChooseMoney).addClass("in_active")
            $(dayChooseMoney).removeClass("in_active")
            $(hourChooseMoney).removeClass("in_active")
        })
        $(weekChoosePoint).click(function (e) {
            e.stopPropagation();
            if(item) {
                item.pointRatePicked = 'week'
                $('#tracked-item-point-' + item.item).html('points: ' + nFormatter(item.oneWeekPoint, 2));
            } else {
                configs.getPointRateFrequency = 'week'
                GM_setValue('configs', configs)
            }
            
            $(weekChoosePoint).addClass("in_active")
            $(dayChoosePoint).removeClass("in_active")
            $(hourChoosePoint).removeClass("in_active")

        })
        return {
            hourChooseMoney: hourChooseMoney,
            hourChoosePoint: hourChoosePoint,
            dayChooseMoney: dayChooseMoney,
            dayChoosePoint: dayChoosePoint,
            weekChooseMoney: weekChooseMoney,
            weekChoosePoint: weekChoosePoint,
        }
    }
    function setTitleWithTooltip(title, tooltip, elemeCont, iconClass) {
        let titleWithTooltipCont = document.createElement('div');
        $(titleWithTooltipCont).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
        })

        let titleWithTooltipTitle = document.createElement('span');
        $(titleWithTooltipTitle).html(title)
        $(titleWithTooltipTitle).css({
            "margin-right": "10px",
            "margin-bottom": "3px",
            "font-size": "10px",
        })

        let titleWithTooltipTooltip = document.createElement('i');
        titleWithTooltipTooltip.classList.add('fa-solid');
        titleWithTooltipTooltip.classList.add(iconClass?iconClass:'fa-circle-info');
        $(titleWithTooltipTooltip).attr("title", tooltip);
        $(titleWithTooltipTooltip).css({
            "margin-left": "auto",
        })

        $(titleWithTooltipCont).append(titleWithTooltipTitle);
        $(titleWithTooltipCont).append(titleWithTooltipTooltip);
        $(elemeCont).append(titleWithTooltipCont);
    }

    async function hud(prod_rate_hud, auto_sell_hud) {
        let autoSellStatusCont = document.createElement('div');
        autoSellStatusCont.id = 'autosell-status-cont';
        autoSellStatusCont.style.cssText = 'cursor: pointer; position: absolute; left: 25%;pointer-events: all;';
        $(autoSellStatusCont).css({
            "display": "none",
            "flex-wrap": "wrap",
            "align-items": "center",
            "width": "fit-content",
            "background": "#00000029",
            "padding": "10px",
            "zIndex": "9999999",
        })

        let autoSellStatus = document.createElement('div');
        autoSellStatus.id = 'autosell-status';
        $(autoSellStatus).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
            "width": "fit-content",
        })
        let autoSellContent = document.createElement('div');
        autoSellContent.style.cssText = 'background-color: unset; padding-left: 10px; padding-right: 10px;flex-basis: unset;font-size: 12px;color: white;';
        autoSellContent.textContent = 'Open Auto-Sell Monitor';
        $(autoSellContent).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
        })
        let autoSellContentIcon = document.createElement('i');
        autoSellContentIcon.classList.add('dragStatus');
        autoSellContentIcon.classList.add('fa-solid');
        autoSellContentIcon.classList.add('fa-arrow-up-right-from-square');
        $(autoSellContentIcon).attr("title", "Open Auto-Sell Monitor");
        $(autoSellContentIcon).css({
            "color": "rgb(246 246 246)",
            "fontSize": "16px",
            "padding": "0 5px",
        });
        $(autoSellContentIcon).hover(function () {
            $(this).css("color", "rgb(246 246 246)");
        }, function () {
            $(this).css("color", "rgb(246 246 246 / 77%)");
        });
        let RateMonitorContent = document.createElement('div');
        RateMonitorContent.style.cssText = 'background-color: unset; padding-left: 10px; padding-right: 10px;flex-basis: unset;font-size: 12px;color: white;';
        RateMonitorContent.textContent = 'Open rate monitor';
        let RateMonitorContentIcon = document.createElement('i');
        RateMonitorContentIcon.classList.add('dragStatus');
        RateMonitorContentIcon.classList.add('fa-solid');
        RateMonitorContentIcon.classList.add('fa-arrow-up-right-from-square');
        $(RateMonitorContentIcon).attr("title", "Open rate monitor");
        $(RateMonitorContentIcon).css({
            "color": "rgb(246 246 246)",
            "fontSize": "16px",
            "padding": "0 5px",
        });
        $(RateMonitorContentIcon).hover(function () {
            $(this).css("color", "rgb(246 246 246)");
        }, function () {
            $(this).css("color", "rgb(246 246 246 / 77%)");
        });
        await WaitForElement('.hud');

        let dragStatus = document.createElement('i');
        dragStatus.classList.add('dragStatus');
        dragStatus.classList.add('fa-solid');
        dragStatus.classList.add('fa-grip-vertical');
        $(dragStatus).attr("title", "Drag this window");
        $(dragStatus).css({
            "color": "rgb(246 246 246 / 77%)",
            "fontSize": "16px",
            "padding": "0 5px",
        });
        $(dragStatus).hover(function () {
            $(this).css("color", "rgb(246 246 246)");
        }, function () {
            $(this).css("color", "rgb(246 246 246 / 77%)");
        });

        /* Option menu start */
        let optionMenu = document.createElement('nav');
        optionMenu.id = 'main-nav';

        let optionMenUl = document.createElement('ul');

        let optionMenUlLi = document.createElement('li');

        let optionMenUlLiIcon = document.createElement('i');
        optionMenUlLiIcon.classList.add('optionMenUlLiIcon');
        optionMenUlLiIcon.classList.add('fa-solid');
        optionMenUlLiIcon.classList.add('fa-ellipsis-vertical');
        $(optionMenUlLiIcon).css({
            "color": "rgb(246 246 246 / 77%)",
            "fontSize": "16px",
            "padding": "0 5px",
        });
        $(optionMenUlLiIcon).hover(function () {
            $(this).css("color", "rgb(246 246 246)");
        }, function () {
            $(this).css("color", "rgb(246 246 246 / 77%)");
        });

        let optionMenUlLiUl = document.createElement('ul');
        $(optionMenUlLiUl).css({
            "color": "white",
        });

        let optionMenUlLiUlLiRate = document.createElement('li');
        setTitleWithTooltip("Production rate monitor settings", "All the settings for production rate monitor", optionMenUlLiUlLiRate, "fa-angle-right")

        let optionMenUlLiUlLiUlRate = document.createElement('ul');
        $(optionMenUlLiUlLiUlRate).css({
            "color": "white",
        });

        let optionMenUlLiUlLiUlMoneyFrequencyDefault = document.createElement('li');
        let optionMenUlLiUlLiUlPointFrequencyDefault = document.createElement('li');

        let timeChooseMoney = document.createElement('div');
        timeChooseMoney.classList.add('timeChoose');
        $(timeChooseMoney).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
            "marginBottom": "7px",
        });
        let timeChoosePoint = document.createElement('div');
        timeChoosePoint.classList.add('timeChoose');
        $(timeChoosePoint).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
        });

        let hourChooseArray = hourChoose(undefined)

        let hourChooseMoney = hourChooseArray.hourChooseMoney

        let dayChooseMoney = hourChooseArray.dayChooseMoney

        let dayChoosePoint = hourChooseArray.dayChoosePoint

        let hourChoosePoint = hourChooseArray.hourChoosePoint

        let weekChooseMoney = hourChooseArray.weekChooseMoney

        let weekChoosePoint = hourChooseArray.weekChoosePoint

        $(timeChooseMoney).append(hourChooseMoney);
        $(timeChooseMoney).append(dayChooseMoney);
        $(timeChooseMoney).append(weekChooseMoney);

        $(timeChoosePoint).append(hourChoosePoint);
        $(timeChoosePoint).append(dayChoosePoint);
        $(timeChoosePoint).append(weekChoosePoint);

        setTitleWithTooltip("Default Money Frequency", "The default money frequency for production rate monitor", optionMenUlLiUlLiUlMoneyFrequencyDefault)
        $(optionMenUlLiUlLiUlMoneyFrequencyDefault).append(timeChooseMoney);
        setTitleWithTooltip("Default Point Frequency", "The default point frequency for production rate monitor", optionMenUlLiUlLiUlPointFrequencyDefault)
        $(optionMenUlLiUlLiUlPointFrequencyDefault).append(timeChoosePoint);

        let optionMenUlLiUlLiAutoSell = document.createElement('li');
        setTitleWithTooltip("Auto sell monitor settings", "All the settings for auto sell monitor", optionMenUlLiUlLiAutoSell, "fa-angle-right")

        let optionMenUlLiUlLiUlAutoSell = document.createElement('ul');
        $(optionMenUlLiUlLiUlAutoSell).css({
            "color": "white",
        });

        let rangeKeepAmntCont = document.createElement('div');
        $(rangeKeepAmntCont).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
        });
        let rangeKeepAmnt = document.createElement('input');
        $(rangeKeepAmnt).attr("data-id", "-keepAmnt");
        $(rangeKeepAmnt).addClass("range-value")
        $(rangeKeepAmnt).attr("type", "range");
        $(rangeKeepAmnt).attr("min", "0");
        $(rangeKeepAmnt).attr("max", "200");
        $(rangeKeepAmnt).attr("step", "1");
        $(rangeKeepAmnt).attr("value", configs.keepAmtStepDefault);
        let rangeKeepAmntValue = document.createElement('span');
        $(rangeKeepAmntValue).addClass("range-value")
        $(rangeKeepAmntValue).html(configs.keepAmtStepDefault)

        $(rangeKeepAmntCont).append(rangeKeepAmnt);
        $(rangeKeepAmntCont).append(rangeKeepAmntValue);

        $(rangeKeepAmnt).css({
            "height": "fit-content",
            "width": "70%",
        })

        $(rangeKeepAmnt).on('input', function (event) {
            event.stopPropagation();
            $(this).next('.range-value').html(this.value);
            //craftedItem.keepAmt = parseInt(this.value)
            configs.keepAmtStepDefault = this.value
            GM_setValue('configs', configs)
        });

        $(rangeKeepAmnt).on('mousedown', function (event) {
            event.stopPropagation();
        });

        let rangeSellMinCont = document.createElement('div');
        $(rangeSellMinCont).css({
            "display": "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
        });
        let rangeSellMin = document.createElement('input');
        $(rangeSellMin).attr("data-id", "-sellMin");
        $(rangeSellMin).addClass("range-value")
        $(rangeSellMin).attr("type", "range");
        $(rangeSellMin).attr("min", "0");
        $(rangeSellMin).attr("max", "200");
        $(rangeSellMin).attr("step", "1");
        $(rangeSellMin).attr("value", configs.sellMinStepDefault);
        let rangeSellMinValue = document.createElement('span');
        $(rangeSellMinValue).addClass("range-value")
        $(rangeSellMinValue).html(configs.sellMinStepDefault)

        $(rangeSellMinCont).append(rangeSellMin);
        $(rangeSellMinCont).append(rangeSellMinValue);

        $(rangeSellMin).css({
            "height": "fit-content",
            "width": "70%",
        })

        $(rangeSellMin).on('input', function (event) {
            event.stopPropagation();
            $(this).next('.range-value').html(this.value);
            configs.sellMinStepDefault = this.value
            GM_setValue('configs', configs)
        });

        $(rangeSellMin).on('mousedown', function (event) {
            event.stopPropagation();
        });

        $(optionMenu).append(optionMenUl);
        $(optionMenUl).append(optionMenUlLi);
        $(optionMenUlLi).append(optionMenUlLiIcon);
        $(optionMenUlLi).append(optionMenUlLiUl);
        $(optionMenUlLiUl).append(optionMenUlLiUlLiRate);
        $(optionMenUlLiUlLiRate).append(optionMenUlLiUlLiUlRate);
        $(optionMenUlLiUlLiUlRate).append(optionMenUlLiUlLiUlMoneyFrequencyDefault);
        $(optionMenUlLiUlLiUlRate).append(optionMenUlLiUlLiUlPointFrequencyDefault);

        $(optionMenUlLiUl).append(optionMenUlLiUlLiAutoSell);
        $(optionMenUlLiUlLiAutoSell).append(optionMenUlLiUlLiUlAutoSell);
        setTitleWithTooltip("Default Keep amount", "The default range for auto sell monitor", optionMenUlLiUlLiUlAutoSell)
        $(optionMenUlLiUlLiUlAutoSell).append(rangeKeepAmntCont);
        setTitleWithTooltip("Default Sell minimum", "The default sell minimum for auto sell monitor", optionMenUlLiUlLiUlAutoSell)
        $(optionMenUlLiUlLiUlAutoSell).append(rangeSellMinCont);

        /* Option menu end */

        $(autoSellContent).prepend(autoSellContentIcon);
        $(RateMonitorContent).prepend(RateMonitorContentIcon);
        $(autoSellStatus).append(autoSellContent);
        $(autoSellStatus).append(RateMonitorContent);
        $(autoSellStatusCont).append(dragStatus);
        $(autoSellStatusCont).append(autoSellStatus);
        $(autoSellStatusCont).append(optionMenu);
        document.querySelector('.hud').prepend(autoSellStatusCont);
        await WaitForElement('#autosell-status');
        $('#main-nav > ul').dropotron({hideDelay: 250,})
        await WaitForElement('.dropotron.level-0');
        $(".dropotron.level-1").click(function(e) {e.stopPropagation();})
        $(autoSellStatusCont).css({
            "display": "flex",
        })
        $("#autosell-status-cont").draggable({
            handle: ".dragStatus",
            axis: "x",
            drag: function (e) {
                e.stopPropagation();
            },
        });
        $(RateMonitorContent).click(function () {
            $(prod_rate_hud).toggle();
        });
        $(autoSellContent).click(function () {
            $("#autoSellHud").toggle();
        })
        CheckCrafts();
    }

    let loaded = 0;

    new MutationObserver(function (mutations) {
        if (document.querySelector('.hud .right .hud-right') && loaded == 0) {
            loaded = 1;
            LoadProductionHud();
            LoadAutoSellHud();
        }
    }).observe(document, { childList: true, subtree: true });

    /*Production rate start*/

    async function WaitForElement(selector) {
        while (document.querySelector(selector) === null) {
            await new Promise(resolve => requestAnimationFrame(resolve))
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        return document.querySelector(selector);
    }

    async function LoadProductionHud() {
        let prod_rate_hud = document.createElement('div');
        prod_rate_hud.id = 'prodRateHud';
        prod_rate_hud.classList.add('ui-widget-content');
        $(prod_rate_hud).css({
            "cursor": "pointer",
            "top": '20px',
            "right": '20px',
            "zIndex": '200',
            "height": "50px",
            "background": "rgba(236, 235, 235, 0.7)",
            "border": "7px solid rgb(254 94 94)",
            "borderRadius": "5px",
            "min-height": "50px",
            "height": "200px",
            "min-width": "400px",
            "width": "400px",
            "overflow": "hidden",
            "padding": "20px",
            "position": "absolute",
            "max-height": "40vh",
            "pointer-events": "all",
        });

        let itemList = document.createElement('div');
        itemList.id = 'itemList';
        $(itemList).css({
            "width": "100%",
            "height": "calc(100% - 20px)",
            "overflow-y": "scroll",
            "scrollbar-color": "rgb(254 94 94)",
        });



        let closeIcon = document.createElement('i');
        closeIcon.classList.add('fa-solid');
        closeIcon.classList.add('fa-circle-xmark');
        $(closeIcon).attr("title", "Close this window");
        $(closeIcon).css({
            "color": "rgb(254 94 94 / 65%)",
            "position": "absolute",
            "top": "10px",
            "right": "20px",
            "fontSize": "23px",
        });
        $(closeIcon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });
        $(closeIcon).click(function () {
            $(prod_rate_hud).toggle();
        });
        let dragIcon = document.createElement('i');
        dragIcon.classList.add('drag');
        dragIcon.classList.add('fa-solid');
        dragIcon.classList.add('fa-arrows-up-down-left-right');
        $(dragIcon).attr("title", "Drag this window");
        $(dragIcon).css({
            "color": "rgb(254 94 94 / 65%)",
            "position": "absolute",
            "top": "10px",
            "right": "55px",
            "fontSize": "23px",
        });
        $(dragIcon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });

        let reloadIcon = document.createElement('i');
        reloadIcon.classList.add('reload');
        reloadIcon.classList.add('fa-solid');
        reloadIcon.classList.add('fa-arrow-rotate-right');
        $(reloadIcon).attr("title", "Reset this data window");
        $(reloadIcon).css({
            "color": "rgb(254 94 94 / 65%)",
            "position": "absolute",
            "top": "10px",
            "right": "90px",
            "fontSize": "23px",
        });
        $(reloadIcon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });

        $(reloadIcon).click(function () {
            GM_deleteValue("trackedRateItem")
            trackedItems = []
            $(itemList).html("")
        })

        // prod_rate_hud.append(input);
        prod_rate_hud.append(closeIcon);
        prod_rate_hud.append(dragIcon);
        prod_rate_hud.append(reloadIcon);
        $(prod_rate_hud).append('<h1> Production Rate Monitor </h1>');
        prod_rate_hud.append(itemList);
        //$('body').append('<div id = "prodRateHud" class = "ui-widget-content" style="cursor:pointer;position:absolute;top:'+GM_getValue("top")+'px;z-index:'+_highest+';left:'+GM_getValue("left")+'px;background:#ecebeb;border:1px solid #333;border-radius:5px;height:50px;width:300px;"> Hello, This is an addon div from Greasemonkey. <input type = "text" value = "type something here"></input> </div>');
        $('.hud').prepend(prod_rate_hud);
        $("#prodRateHud").draggable({
            handle: ".drag",
            drag: function (e) {
                e.stopPropagation();
            }
        });

        $("#prodRateHud h1").css({
            "fontSize": "20px",
            "color": "rgb(254, 94, 94)",
        })
        $('#prodRateHud').resizable({
            resize: function (e) {
                e.stopPropagation();
            },
            start: function (e) {
                $('#prodRateHud').css("maxHeight", "unset");
            },
            stop: function (e) {
                $('#prodRateHud').css("maxHeight", $('#prodRateHud').height());
            },

        });
        $("#itemList").sortable();

        $("#prodRateHud").bind('mousewheel DOMMouseScroll', function (event) {
            event.stopPropagation();
        });

        if (trackedItems && trackedItems.length > 0) {
            for (let trackedItem of trackedItems) {
                if (trackedItem.lastComingTime) {
                    let timeDiff = Date.now() - trackedItem.lastComingTime;
                    trackedItem.first = trackedItem.first + timeDiff
                }
                addItemToDom(trackedItem);
            }
        }

        function addItemToDom(item) {
            let trackedItemElem = document.createElement('div');
            trackedItemElem.classList.add('trackedItemElem');
            trackedItemElem.id = 'tracked-item-' + item.item;
            $(trackedItemElem).css({
                "marginTop": "10px",
                "width": "calc(100% - 30px)",
                "padding": "10px",
                "background": "white",
                "borderRadius": "6px",
            });

            let trackedItemElemH1 = document.createElement('h1');
            trackedItemElemH1.innerHTML = '<img src="' + UiTools.getIconFileUrl(item.item) + '" width="30" />' + item.item.replaceAll("_", " ");
            $(trackedItemElemH1).css({
                "fontSize": "17px",
                "color": "black",
                "display": "flex",
                "flex-wrap": "wrap",
                "align-items": "center",
                "margin": "0",
            });

            let trackedItemElemProdRate = document.createElement('div');
            trackedItemElemProdRate.id = 'tracked-item-prod-rate-' + item.item;
            //trackedItemElemProdRate.classList.add('bank', 'contextual');
            trackedItemElemProdRate.innerHTML = item.count + ' | ' + item.oneMin.toFixed(2) + ' | ' + item.oneHour.toFixed(2);
            $(trackedItemElemProdRate).css({
                "font-size": "12px",
                "font-weight": "800",
                "margin-left": "20px",
            });
            let moreFromProdRate = document.createElement('span');
            $(moreFromProdRate).addClass("moreFromProdRate")
            $(moreFromProdRate).attr("data-name", item.item);
            $(moreFromProdRate).css({
                "padding-right": "10px",
                "margin-left": "auto",
                "color": "rgb(254 94 94 / 65%)",
            })
            $(moreFromProdRate).html('<i style="color:rgb(254 94 94 / 65%);" class="fa-solid fa-caret-down">')

            $("body").on("mouseenter", ".moreFromProdRate i", function () {
                $(this).css("color", "rgb(254 94 94)");
            });

            $("body").on("mouseleave", ".moreFromProdRate i", function () {
                $(this).css("color", "rgb(254 94 94 / 65%)");
            });

            let timeChooseMoney = document.createElement('div');
            timeChooseMoney.classList.add('timeChoose');
            $(timeChooseMoney).css({
                "display": "flex",
                "flex-wrap": "wrap",
                "align-items": "center",
                "display": "none",
                "marginBottom": "7px",
            });
            let timeChoosePoint = document.createElement('div');
            timeChoosePoint.classList.add('timeChoose');
            $(timeChoosePoint).css({
                "display": "flex",
                "flex-wrap": "wrap",
                "align-items": "center",
                "display": "none",
            });

            let hourChooseArray = hourChoose(item)

            let hourChooseMoney = hourChooseArray.hourChooseMoney

            let dayChooseMoney = hourChooseArray.dayChooseMoney

            let dayChoosePoint = hourChooseArray.dayChoosePoint

            let hourChoosePoint = hourChooseArray.hourChoosePoint

            let weekChooseMoney = hourChooseArray.weekChooseMoney

            let weekChoosePoint = hourChooseArray.weekChoosePoint

            $(timeChooseMoney).append(hourChooseMoney);
            $(timeChooseMoney).append(dayChooseMoney);
            $(timeChooseMoney).append(weekChooseMoney);

            $(timeChoosePoint).append(hourChoosePoint);
            $(timeChoosePoint).append(dayChoosePoint);
            $(timeChoosePoint).append(weekChoosePoint);

            let trackedItemElemMoney = document.createElement('span');
            trackedItemElemMoney.id = 'tracked-item-money-' + item.item;
            trackedItemElemMoney.style = 'width: 75%;';
            let properFrequencyMoney = configs.getMoneyRateFrequency == 'hour'?item.oneHourMoney:configs.getMoneyRateFrequency == 'day'?item.oneDayMoney:item.oneWeekMoney
            trackedItemElemMoney.innerHTML = 'money: $' + nFormatter(properFrequencyMoney, 2);
            if(item.oneHourMoney <= 0) {
                $(trackedItemElemMoney).css("color", "red")
                $(trackedItemElemMoney).append(addIcon({
                    iconClass: "fa-circle-info",
                    tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                    css : {
                        "color": "rgb(254 94 94 / 65%)",
                        "fontSize": "14px",
                        "marginLeft": "7px",
                        "position": "relative",
                        "top": "1px",
                    }}))
            } else {
                $(trackedItemElemMoney).css("color", "unset")
            }
            $(trackedItemElemMoney).css({
                "fontSize": "12px",
                "fontWeight": "800",
            });
            $(timeChooseMoney).append(trackedItemElemMoney);

            let trackedItemElemPoint = document.createElement('span');
            trackedItemElemPoint.id = 'tracked-item-point-' + item.item;
            trackedItemElemPoint.style = 'width: 75%;';
            let properFrequencyPoint = configs.getPointRateFrequency == 'hour'?item.oneHourPoint:configs.getPointRateFrequency == 'day'?item.oneDayPoint:item.oneWeekPoint
            trackedItemElemPoint.innerHTML = 'points: ' + nFormatter(properFrequencyPoint, 2);
            $(trackedItemElemPoint).css({
                "fontSize": "12px",
                "fontWeight": "800",
            });
            $(timeChoosePoint).append(trackedItemElemPoint);

            $(itemList).append(trackedItemElem);
            $(trackedItemElemH1).append(trackedItemElemProdRate);
            $(trackedItemElemH1).append(moreFromProdRate);
            $(trackedItemElem).append(trackedItemElemH1);
            $(trackedItemElem).append(timeChooseMoney);
            $(trackedItemElem).append(timeChoosePoint);

            let isOpen = false
            $(moreFromProdRate).click(function () {
                $(timeChooseMoney).toggle("slide", { direction: "up" }, 300)
                $(timeChoosePoint).toggle("slide", { direction: "up" }, 300)
                if (isOpen) {
                    $("#tracked-item-" + item.item + " .moreFromProdRate i").animateRotate(0);
                } else {
                    $("#tracked-item-" + item.item + " .moreFromProdRate i").animateRotate(-180);
                }
                isOpen = !isOpen
            })


        }

        hud(prod_rate_hud);

        class TrackUnitDeliverOutputTask extends UnitDeliverOutputTask {

            onArrive() {
                super.onArrive();
                // console.log("Game object", Game)
                // console.log("tracked Items", trackedItems)
                let trackedItem = trackedItems.find(item => item.item.toUpperCase() == this.craft.toUpperCase())
                if (!trackedItem) {
                    let currentItem = Game.craftData[this.craft];
                    trackedItem = {
                        item: currentItem.Name,
                        count: 0,
                        first: 0,
                        oneMin: 0,
                        oneHour: 0,
                        oneHourMoney: 0,
                        oneDayMoney: 0,
                        oneWeekMoney: 0,
                        oneHourPoint: 0,
                        oneDayPoint: 0,
                        oneWeekPoint: 0,
                        moneyRatePicked: configs.getMoneyRateFrequency,
                        pointRatePicked: configs.getPointRateFrequency,
                        sold: currentItem.CityPrice,
                        point: currentItem.CityPoints
                    };
                    trackedItems.push(trackedItem);
                    addItemToDom(trackedItem);
                }

                trackedItem.count++;
                if (trackedItem.count == 1) {
                    trackedItem.first = Date.now();
                    trackedItem.lastComingTime = Date.now()
                } else {
                    let timeDiff = Date.now() - trackedItem.first;
                    trackedItem.oneMin = trackedItem.count / (timeDiff / 60000)
                    trackedItem.oneHour = trackedItem.count / (timeDiff / 3600000)
                    trackedItem.oneDayMoney = ((((trackedItem.oneMin * 60) * 24)) * trackedItem.sold) - ((Game.town.GetTotalLaborCost() * 60 * 24))
                    trackedItem.oneHourMoney = ((((trackedItem.oneMin * 60))) * trackedItem.sold) - ((Game.town.GetTotalLaborCost() * 60))
                    trackedItem.oneWeekMoney = ((((trackedItem.oneMin * 60) * 24 * 7)) * trackedItem.sold) - ((Game.town.GetTotalLaborCost() * 60 * 24 * 7))
                    trackedItem.oneDayPoint = ((((trackedItem.oneMin * 60) * 24)) * trackedItem.point)
                    trackedItem.oneHourPoint = ((((trackedItem.oneMin * 60))) * trackedItem.point)
                    trackedItem.oneWeekPoint = ((((trackedItem.oneMin * 60) * 24 * 7)) * trackedItem.point)
                    trackedItem.lastComingTime = Date.now()
                }
                GM_setValue('trackedRateItem', JSON.stringify(trackedItems))
                $('#tracked-item-prod-rate-' + trackedItem.item).html(trackedItem.count + ' | ' + trackedItem.oneMin.toFixed(2) + ' | ' + trackedItem.oneHour.toFixed(2));
                if (trackedItem.moneyRatePicked == 'hour'){
                    $('#tracked-item-money-' + trackedItem.item).html('money: $' + nFormatter(trackedItem.oneHourMoney, 2));
                    if(trackedItem.oneHourMoney <= 0) {
                        $('#tracked-item-money-' + trackedItem.item).css("color", "red")
                        $('#tracked-item-money-' + trackedItem.item).append(addIcon({
                            iconClass: "fa-circle-info",
                            tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                            css : {
                                "color": "rgb(254 94 94 / 65%)",
                                "fontSize": "14px",
                                "marginLeft": "7px",
                                "position": "relative",
                                "top": "1px",
                            }}))
                    } else {
                        $('#tracked-item-money-' + trackedItem.item).css("color", "unset")
                    }
                } else if (trackedItem.moneyRatePicked == 'day') {
                    $('#tracked-item-money-' + trackedItem.item).html('money: $' + nFormatter(trackedItem.oneDayMoney, 2));
                    if(trackedItem.oneDayMoney <= 0) {
                        $('#tracked-item-money-' + trackedItem.item).css("color", "red")
                        $('#tracked-item-money-' + trackedItem.item).append(addIcon({
                            iconClass: "fa-circle-info",
                            tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                            css : {
                                "color": "rgb(254 94 94 / 65%)",
                                "fontSize": "14px",
                                "marginLeft": "7px",
                                "position": "relative",
                                "top": "1px",
                            }}))
                    } else {
                        $('#tracked-item-money-' + trackedItem.item).css("color", "unset")
                    }
                } else if (trackedItem.moneyRatePicked == 'week') {
                    $('#tracked-item-money-' + trackedItem.item).html('money: $' + nFormatter(trackedItem.oneWeekMoney, 2));
                    if(trackedItem.oneWeekMoney <= 0) {
                        $('#tracked-item-money-' + trackedItem.item).css("color", "red")
                        $('#tracked-item-money-' + trackedItem.item).append(addIcon({
                            iconClass: "fa-circle-info",
                            tooltip: "This item give less money than the town cost to you. If you sell only this item you will lose money",
                            css : {
                                "color": "rgb(254 94 94 / 65%)",
                                "fontSize": "14px",
                                "marginLeft": "7px",
                                "position": "relative",
                                "top": "1px",
                            }}))
                    } else {
                        $('#tracked-item-money-' + trackedItem.item).css("color", "unset")
                    }
                }

                if (trackedItem.pointRatePicked == 'hour')
                    $('#tracked-item-point-' + trackedItem.item).html('points: ' + nFormatter(trackedItem.oneHourPoint, 2));
                else if (trackedItem.pointRatePicked == 'day')
                    $('#tracked-item-point-' + trackedItem.item).html('points: ' + nFormatter(trackedItem.oneDayPoint, 2));
                else if (trackedItem.pointRatePicked == 'week')
                    $('#tracked-item-point-' + trackedItem.item).html('points: ' + nFormatter(trackedItem.oneWeekPoint, 2));
            }

        }

        let origfindDeliverOutputTask = TS_UnitLogic.prototype.findDeliverOutputTask;
        TS_UnitLogic.prototype.findDeliverOutputTask = function (t) {
            let origReturn = origfindDeliverOutputTask.call(this, t);
            return origReturn ? new TrackUnitDeliverOutputTask(origReturn.unit, origReturn.targetObject, t) : null
        }
    }
    /*Production rate end*/


    /*Auto sell start*/

    async function generateddSlick(ItemToAddInSellingList) {
        $('#myDropdown').ddslick({
            data: ItemToAddInSellingList,
            width: 300,
            selectText: "Select Item to auto sell",
            imagePosition: "right",
            onSelected: function (selectedData) {
                //callback function: do something with selectedData;
                craftedItems.push({ item: selectedData.selectedData.value, keepAmt: 0, sellMin: 0 },)
                generateItemSelectedUl("#autoSellItemSelectedUl")
                generateItemToAddInSellingList(false)
                GM_setValue('craftedItem', JSON.stringify(craftedItems))
            }
        });

        await WaitForElement('.dd-options');

        $('.dd-options').css("maxHeight", "400px")
    }

    function generateItemSelectedUl(ul) {
        $(ul).html("")
        for (let craftedItem of craftedItems) {
            if (UiTools.getIconFileUrl(craftedItem.item)) {
                let item_selected_li = document.createElement('li');
                $(item_selected_li).addClass(craftedItem.item + " autoSellItemSelectedUi")

                let iconFromAutoSell = document.createElement('span');
                $(iconFromAutoSell).css({
                    "margin-left": "auto",
                })

                let deleteItemFromAutoSell = document.createElement('span');
                $(deleteItemFromAutoSell).addClass("deleteItemFromAutoSell")
                $(deleteItemFromAutoSell).attr("data-name", craftedItem.item);

                $(deleteItemFromAutoSell).css({
                    "padding-right": "10px",
                    "color": "rgb(254 94 94 / 65%)",
                })
                $(deleteItemFromAutoSell).html('<i style="color:rgb(254 94 94 / 65%);" class="fa-solid fa-trash">')

                $("body").on("mouseenter", ".deleteItemFromAutoSell i", function () {
                    $(this).css("color", "rgb(254 94 94)");
                });

                $("body").on("mouseleave", ".deleteItemFromAutoSell i", function () {
                    $(this).css("color", "rgb(254 94 94 / 65%)");
                });

                let moreFromAutoSell = document.createElement('span');
                $(moreFromAutoSell).addClass("moreFromAutoSell")
                $(moreFromAutoSell).attr("data-name", craftedItem.item);
                $(moreFromAutoSell).css({
                    "padding-right": "10px",
                    "color": "rgb(254 94 94 / 65%)",
                })
                $(moreFromAutoSell).html('<i style="color:rgb(254 94 94 / 65%);" class="fa-solid fa-caret-down">')

                $("body").on("mouseenter", ".moreFromAutoSell i", function () {
                    $(this).css("color", "rgb(254 94 94)");
                });

                $("body").on("mouseleave", ".moreFromAutoSell i", function () {
                    $(this).css("color", "rgb(254 94 94 / 65%)");
                });

                $(item_selected_li).append("<img style='display:inline-block;' width='40' src='https://townstar.sandbox-games.com/" + UiTools.getIconFileUrl(craftedItem.item) + "' />");
                $(item_selected_li).append("<span>" + craftedItem.item.replaceAll("_", " ") + "</span>")
                $(iconFromAutoSell).append(moreFromAutoSell)
                $(iconFromAutoSell).append(deleteItemFromAutoSell)
                $(item_selected_li).append(iconFromAutoSell)
                $(item_selected_li).css({
                    "display": "flex",
                    "flex-wrap": "wrap",
                    "align-items": "center",
                })

                let item_selected_li_config = document.createElement('li');
                $(item_selected_li_config).addClass(craftedItem.item + " autoSellItemSelectedUiConfig")

                $(item_selected_li_config).css({
                    "marginBottom": "4px",
                    "display": "none",
                    "background": "white",
                    "padding": "10px",
                    "width": "90%",
                    "borderRadius": "10px",
                })

                // KeepAmt config
                let item_selected_li_config_keep_amt_title = document.createElement('div');
                $(item_selected_li_config_keep_amt_title).addClass(craftedItem.item + "-keepAmntTitle")
                $(item_selected_li_config_keep_amt_title).html('Keep amount <i title="Keep amount is the amount that you do not want to sell" class="fa-solid fa-circle-info"></i>')

                let item_selected_li_config_keep_amt_div = document.createElement('div');

                let rangeKeepAmnt = document.createElement('input');
                $(rangeKeepAmnt).attr("data-id", craftedItem.item + "-keepAmnt");
                $(rangeKeepAmnt).addClass("range-value")
                $(rangeKeepAmnt).attr("type", "range");
                $(rangeKeepAmnt).attr("min", "0");
                $(rangeKeepAmnt).attr("max", "200");
                $(rangeKeepAmnt).attr("step", configs.sellMinStepDefault);
                $(rangeKeepAmnt).attr("value", craftedItem.keepAmt ? craftedItem.keepAmt.toString() : configs.keepAmtStepDefault);
                let rangeKeepAmntValue = document.createElement('span');
                $(rangeKeepAmntValue).addClass("range-value")
                $(rangeKeepAmntValue).html(craftedItem.keepAmt ? craftedItem.keepAmt.toString() : configs.keepAmtStepDefault)

                $(rangeKeepAmnt).css({
                    "height": "fit-content",
                })

                $(item_selected_li_config_keep_amt_div).css({
                    "display": "flex",
                    "flex-wrap": "wrap",
                    "align-items": "center",
                    "padding-right": "40px",
                })

                $(item_selected_li_config_keep_amt_div).append(rangeKeepAmnt);
                $(item_selected_li_config_keep_amt_div).append(rangeKeepAmntValue);

                $(item_selected_li_config).append(item_selected_li_config_keep_amt_title);
                $(item_selected_li_config).append(item_selected_li_config_keep_amt_div);

                $(rangeKeepAmnt).on('input', function (event) {
                    event.stopPropagation();
                    $(this).next('.range-value').html(this.value);
                    craftedItem.keepAmt = parseInt(this.value)
                    GM_setValue('craftedItem', JSON.stringify(craftedItems))
                });

                $(rangeKeepAmnt).on('mousedown', function (event) {
                    event.stopPropagation();
                });

                // SellMin config
                let item_selected_li_config_sell_min_title = document.createElement('div');
                $(item_selected_li_config_sell_min_title).addClass(craftedItem.item + "-sellMinTitle")
                $(item_selected_li_config_sell_min_title).html('Sell minimum <i title="Sell minimum is the minimum amount needed before attempting to sell" class="fa-solid fa-circle-info"></i>')

                let item_selected_li_config_sell_min_div = document.createElement('div');

                let rangeSellMin = document.createElement('input');
                $(rangeSellMin).attr("data-id", craftedItem.item + "-sellMin");
                $(rangeSellMin).addClass("range-value")
                $(rangeSellMin).attr("type", "range");
                $(rangeSellMin).attr("min", "0");
                $(rangeSellMin).attr("max", "200");
                $(rangeSellMin).attr("step", "1");
                $(rangeSellMin).attr("value", craftedItem.sellMin ? craftedItem.sellMin.toString() : configs.sellMinStepDefault);
                let rangeSellMinValue = document.createElement('span');
                $(rangeSellMinValue).addClass("range-value")
                $(rangeSellMinValue).html(craftedItem.sellMin ? craftedItem.sellMin.toString() : configs.sellMinStepDefault)

                $(rangeSellMin).css({
                    "height": "fit-content",
                })

                $(item_selected_li_config_sell_min_div).css({
                    "display": "flex",
                    "flex-wrap": "wrap",
                    "align-items": "center",
                    "padding-right": "40px",
                })

                $(item_selected_li_config_sell_min_div).append(rangeSellMin);
                $(item_selected_li_config_sell_min_div).append(rangeSellMinValue);

                $(item_selected_li_config).append(item_selected_li_config_sell_min_title);
                $(item_selected_li_config).append(item_selected_li_config_sell_min_div);

                $(rangeSellMin).on('input', function (event) {
                    event.stopPropagation();
                    $(this).next('.range-value').html(this.value);
                    craftedItem.sellMin = parseInt(this.value)
                    GM_setValue('craftedItem', JSON.stringify(craftedItems))
                });

                $(rangeSellMin).on('mousedown', function (event) {
                    event.stopPropagation();
                });
                let isOpen = false
                $(moreFromAutoSell).click(function () {
                    $(item_selected_li_config).toggle("slide", { direction: "up" }, 300)
                    if (isOpen) {
                        $("." + craftedItem.item + ".autoSellItemSelectedUi .moreFromAutoSell i").animateRotate(0);
                    } else {
                        $("." + craftedItem.item + ".autoSellItemSelectedUi .moreFromAutoSell i").animateRotate(-180);
                    }
                    isOpen = !isOpen
                })

                $(ul).append(item_selected_li);
                $(ul).append(item_selected_li_config);
            }
        }
    }

    function generateItemToAddInSellingList(isFirst) {
        var ItemToAddInSellingList = [];
        for (let craftItemKey in Game.craftData) {
            let craftItem = Game.craftData[craftItemKey]
            if (craftedItems.find(it => it.item == craftItem.Name) == undefined) {
                ItemToAddInSellingList.push({
                    text: craftItem.Name.replaceAll("_", " "),
                    value: craftItem.Name,
                    selected: false,
                    description: "Description with Foursquare",
                    imageSrc: "https://townstar.sandbox-games.com/" + UiTools.getIconFileUrl(craftItem.Name)
                })
            }
        }
        if (!isFirst) {
            $('#myDropdown').ddslick('destroy');
            generateddSlick(ItemToAddInSellingList)
        } else {
            return ItemToAddInSellingList
        }
    }

    async function LoadAutoSellHud() {
        //Dropdown plugin data

        let ItemToAddInSellingList = generateItemToAddInSellingList(true)

        let switchAutoSell = '<input type="checkbox" name="switchAutoSell" id="switchAutoSell" checked>'

        let auto_sell_hud = document.createElement('div');
        auto_sell_hud.id = 'autoSellHud';
        auto_sell_hud.classList.add('ui-widget-content');
        $(auto_sell_hud).css({
            "cursor": "pointer",
            "top": '290px',
            "right": '20px',
            "zIndex": '200',
            "height": "50px",
            "background": "rgba(236, 235, 235, 0.7)",
            "border": "7px solid rgb(254 94 94)",
            "borderRadius": "5px",
            "min-height": "50px",
            "height": "200px",
            "min-width": "400px",
            "width": "400px",
            "padding": "20px",
            "position": "absolute",
            "pointer-events": "all",
        });

        let select_item = document.createElement('div');
        select_item.id = 'myDropdown';

        let item_selected_ul = document.createElement('ul');
        item_selected_ul.id = 'autoSellItemSelectedUl';
        $(item_selected_ul).css({
            "height": "calc(100% - 115px)",
            "overflow-y": "auto",
            "padding": "0",
        })

        generateItemSelectedUl(item_selected_ul)

        let closeIcon = document.createElement('i');
        closeIcon.classList.add('fa-solid');
        closeIcon.classList.add('fa-circle-xmark');
        $(closeIcon).attr("title", "Close this window");
        $(closeIcon).css({
            "color": "rgb(254 94 94 / 65%)",
            "position": "absolute",
            "top": "10px",
            "right": "20px",
            "fontSize": "23px",
        });
        $(closeIcon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });
        $(closeIcon).click(function () {
            $(auto_sell_hud).toggle();
        });
        let dragIcon = document.createElement('i');
        dragIcon.classList.add('drag');
        dragIcon.classList.add('fa-solid');
        dragIcon.classList.add('fa-arrows-up-down-left-right');
        $(dragIcon).attr("title", "Drag this window");
        $(dragIcon).css({
            "color": "rgb(254 94 94 / 65%)",
            "position": "absolute",
            "top": "10px",
            "right": "55px",
            "fontSize": "23px",
        });
        $(dragIcon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });

        let autoSellAlert = document.createElement('span');
        autoSellAlert.classList.add('autoSellAlert');
        $(autoSellAlert).css({
            "color": "rgb(254 94 94)",
            "display": "none",
            "position": "relative",
            "top": "-3px",
            "left": "10px",
        });

        let reloadIcon = document.createElement('i');
        reloadIcon.classList.add('reload');
        reloadIcon.classList.add('fa-solid');
        reloadIcon.classList.add('fa-arrow-rotate-right');
        $(reloadIcon).attr("title", "Reset this data window");
        $(reloadIcon).css({
            "color": "rgb(254 94 94 / 65%)",
            "position": "absolute",
            "top": "10px",
            "right": "90px",
            "fontSize": "23px",
        });
        $(reloadIcon).hover(function () {
            $(this).css("color", "rgb(254 94 94)");
        }, function () {
            $(this).css("color", "rgb(254 94 94 / 65%)");
        });

        $(reloadIcon).click(function () {
            GM_deleteValue("craftedItem")
            craftedItems = originalCraftedItems
            generateItemSelectedUl(item_selected_ul)
        })

        // prod_rate_hud.append(input);
        $(auto_sell_hud).append(loader);
        $(auto_sell_hud).append(closeIcon);
        $(auto_sell_hud).append(dragIcon);
        $(auto_sell_hud).append(reloadIcon);
        $(auto_sell_hud).append(switchAutoSell);
        $(auto_sell_hud).append(autoSellAlert);
        $(auto_sell_hud).append('<h1> Auto sell Monitor</h1>');



        $(auto_sell_hud).append(select_item);
        $(auto_sell_hud).append(item_selected_ul);
        $('.hud').prepend(auto_sell_hud);

        await WaitForElement('#myDropdown');

        $("[name='switchAutoSell']").bootstrapSwitch({
            'state': isAutoSellActivated,
            'onSwitchChange': function (event, state) {
                isAutoSellActivated = state;
                if (isAutoSellActivated)
                    $(".autoSellAlert").html("Auto Sell Activated")
                else
                    $(".autoSellAlert").html("Auto Sell Deactivated")

                $(".autoSellAlert").toggle();
                setTimeout(function () {
                    $(".autoSellAlert").toggle();
                }, 3000);
            },
        });

        $(".bootstrap-switch-handle-on").html("&nbsp;")
        $(".bootstrap-switch-handle-off").html("&nbsp;")
        $(".bootstrap-switch").css({
            "minWidth": "50px",
            "border": "unset",
            "maxHeight": "20px",
            "marginBottom": "10px",
        })

        $(".bootstrap-switch-label").css({
            "background": "white",
            "background-image": "unset",
        })

        $(".bootstrap-switch .bootstrap-switch-handle-on.bootstrap-switch-primary").css({
            "backgroundImage": "unset",
            "background": "#05e005",
        })

        $("#autoSellHud h1").css({
            "fontSize": "20px",
            "color": "rgb(254, 94, 94)",
        })


        $(".bootstrap-switch-handle-off").css({
            "backgroundImage": "unset",
            "background": "#ff3e3e",
        })

        $("#autoSellItemSelectedUl img").css({
            "width": "40px",
        })

        generateddSlick(ItemToAddInSellingList)

        $("#autoSellHud").draggable({
            handle: ".drag",
            drag: function (e) {
                e.stopPropagation();
            }
        });
        $('#autoSellHud').resizable({
            resize: function (e) {
                e.stopPropagation();
            },
            start: function (e) {
                $('#autoSellHud').css("maxHeight", "unset");
            },
            stop: function (e) {
                $('#autoSellHud').css("maxHeight", $('#autoSellHud').height());
            },

        });

        $("#autoSellHud").bind('mousewheel DOMMouseScroll', function (event) {
            event.stopPropagation();
        });
        $("body").on("click", ".deleteItemFromAutoSell", function () {
            let name = $(this).attr("data-name");
            let isDeleted = false
            for (let i = 0; i < craftedItems.length; i++) {
                if (craftedItems[i].item == name) {
                    craftedItems.splice(i, 1);
                    isDeleted = true;
                }
            }
            if (isDeleted) {
                generateItemSelectedUl(item_selected_ul)
                generateItemToAddInSellingList(false)
                GM_setValue('craftedItem', JSON.stringify(craftedItems))
            }
        })
        $("#autoSellHud .loader").toggle()
    }

    // AutoSell
    new MutationObserver(function (mutations) {
        let airdropcollected = 0;
        if (document.getElementsByClassName('hud-jimmy-button')[0] && document.getElementsByClassName('hud-jimmy-button')[0].style.display != 'none') {
            document.getElementsByClassName('hud-jimmy-button')[0].click();
            document.getElementById('Deliver-Request').getElementsByClassName('yes')[0].click();
            document.getElementById('Deliver-Request').getElementsByClassName('close-button')[0].click();
        }
        if (document.getElementsByClassName('hud-airdrop-button')[0] && document.getElementsByClassName('hud-airdrop-button')[0].style.display != 'none') {
            if (airdropcollected == 0) {
                airdropcollected = 1;
                document.getElementsByClassName('hud-airdrop-button')[0].click();
                document.getElementsByClassName('air-drop')[0].getElementsByClassName('yes')[0].click();
            }
        }
        if (document.getElementById("playnow-container") && document.getElementById("playnow-container").style.visibility !== "hidden") {
            if (typeof Game == 'undefined' || (Game && Game.gameData == null)) {
                // window.location.reload();
            } else {
                document.getElementById("playButton").click();
                console.log(Date.now() + ' ---===ACTIVATING AUTO SELL===---');
                ActivateAutoSell();
            }
        }
    }).observe(document, { childList: true, subtree: true });

    // AutoSell
    function GetAvailableTradeObject(capacity) {
        return Object.values(Game.town.objectDict).filter(tradeObj => tradeObj.logicType === 'Trade')
            .find(tradeObj =>
                Game.unitsData[tradeObj.objData.UnitType].Capacity == capacity
                && !Game.town.tradesList.find(activeTrade => activeTrade.source.x == tradeObj.townX && activeTrade.source.z == tradeObj.townZ)
            )
    }

    // AutoSell
    function CloseWindows(elements, checkParent) {
        for (let i = 0, n = elements.length; i < n; i++) {
            let el = checkParent ? elements[i].closest('.container') : elements[i];
            let elVis = el.currentStyle ? el.currentStyle.visibility : getComputedStyle(el, null).visibility;
            let elDis = el.currentStyle ? el.currentStyle.display : getComputedStyle(el, null).display;
            if (!(elVis === 'hidden' || elDis === 'none')) {
                el.querySelector('.close-button') && el.querySelector('.close-button').click();
            }
        }
    }

    // AutoSell
    async function WaitForCompletion(selector) {
        while (document.querySelector(selector) !== null) {
            await new Promise(resolve => requestAnimationFrame(resolve))
        }
        return document.querySelector(selector);
    }

    // AutoSell
    async function WaitForTradeLoad(targetTradeObj) {
        return await new Promise(resolve => {
            const waitForUpdate = setInterval(() => {
                let tradeUiObj = Game.app.root.findByName('TradeUi').script.trade.townObject;
                if (tradeUiObj && tradeUiObj.townX == targetTradeObj.townX && tradeUiObj.townZ == targetTradeObj.townZ && Game.app.root.findByName('TradeUi').script.trade.cityPaths[0].gasCost) {
                    resolve('Loaded');
                    clearInterval(waitForUpdate);
                };
            }, 500);
        });
    }

    // AutoSell
    async function CheckCrafts() {
        let allTradeObjects = Object.values(Game.town.objectDict).filter(tradeObj => tradeObj.logicType === 'Trade');
        for (let i = 0, n = allTradeObjects.length; i < n; i++) {
            if (allTradeObjects[i].logicObject.tapToCollectEntity.enabled) {
                allTradeObjects[i].logicObject.OnTapped();
            }
        }
        if (Game.town.GetStoredCrafts()['Gasoline'] >= 1 && isAutoSellActivated) {
            for (let i = 0, n = craftedItems.length; i < n; i++) {
                if (Game.town.GetStoredCrafts()[craftedItems[i].item] >= craftedItems[i].keepAmt + 10) {
                    let targetTradeObj;
                    if (Game.town.GetStoredCrafts()[craftedItems[i].item] >= 100 + craftedItems[i].keepAmt) {
                        targetTradeObj = GetAvailableTradeObject(100);
                    }
                    if (!targetTradeObj && Game.town.GetStoredCrafts()[craftedItems[i].item] >= 50 + craftedItems[i].keepAmt && craftedItems[i].sellMin <= 50) {
                        targetTradeObj = GetAvailableTradeObject(50);
                    }
                    if (!targetTradeObj && Game.town.GetStoredCrafts()[craftedItems[i].item] >= 10 + craftedItems[i].keepAmt && craftedItems[i].sellMin <= 10) {
                        targetTradeObj = GetAvailableTradeObject(10);
                    }
                    if (targetTradeObj) {
                        CloseWindows(document.querySelectorAll('body > .container > .player-confirm .dialog-cell'), false);
                        CloseWindows(document.querySelectorAll('.container > div:not(.hud):not(.player-confirm)'), true);
                        Game.town.selectObject(targetTradeObj);
                        Game.app.fire('SellClicked', { x: targetTradeObj.townX, z: targetTradeObj.townZ });
                        await WaitForCompletion('.LoadingOrders');
                        document.querySelector('#trade-craft-target [data-name="' + craftedItems[i].item + '"]').click();
                        await WaitForTradeLoad(targetTradeObj);
                        if (Game.town.GetStoredCrafts()['Gasoline'] >= Game.app.root.findByName('TradeUi').script.trade.cityPaths[0].gasCost) {
                            document.querySelector('#destination-target .destination .sell-button').click();
                            let tradeTimeout = setTimeout(function () {
                                document.querySelector('.trade-connection .no').click();
                            }, 10000);
                            await WaitForCompletion('.trade-connection .compass');
                            clearTimeout(tradeTimeout);
                        } else if (Game.town.GetStoredCrafts()['Gasoline'] >= 1) {

                            $(".autoSellAlert").html("Run out of gas")

                            $(".autoSellAlert").toggle();
                            setTimeout(function () {
                                $(".autoSellAlert").toggle();
                            }, 3000);
                            document.querySelector('.container > .trade .close-button').click();
                        }
                    }
                }
            }
        } else if (Game.town.GetStoredCrafts()['Gasoline'] < 1) {
            console.log('Whoops! You have run out of gas.');
            $(".autoSellAlert").html("Run out of gas")

            $(".autoSellAlert").toggle();
            setTimeout(function () {
                $(".autoSellAlert").toggle();
            }, 4000);
        }
        setTimeout(CheckCrafts, 5000);
    }
    /*Auto sell end*/
})();
