'use strict';

var handsets = [];
var paging = {
    pageNo: 1,
    pageSize: 3,

    totalPages: -1,
    totalRecords: -1,
    currPageData: [],
    currentData: []
};

function nextPage() {
    if( !isNaN(paging.pageNo) ){
        if( paging.pageNo < paging.totalPages ) {
            paging.pageNo++;
            insertRowsToTable( paging.currentData );
        }
    }
}

function prevPage() {
    if( !isNaN(paging.pageNo) ){
        if( paging.pageNo > 1 ) {
            paging.pageNo--;
            insertRowsToTable( paging.currentData );
        }
    }
}

document.addEventListener("DOMContentLoaded", function (event) { 
    paging.pageNo = 1;
    insertRowsToTable( handsets );
});

function addPhone(){
    var form = document.getElementById("inputForm");
    if( form ) {
        form.elements.namedItem("mName").value = '';
        form.elements.namedItem("mCompany").value = '';
        form.elements.namedItem("mReleaseDt").value = '';
        form.elements.namedItem("mDesc").value = '';
    }
	var displayView = document.getElementById( 'displayView' );
	displayView.style.display = "none";
	var inputView = document.getElementById( 'inputView' );
	inputView.style.display = "";
}

function navigateToSearch(){
    var displayView = document.getElementById( 'displayView' );
	displayView.style.display = "";
	var inputView = document.getElementById( 'inputView' );
	inputView.style.display = "none";
}

function saveForm(){
	var form = document.getElementById("inputForm");
	if( form ) {
        var newPhone = {
            name: form.elements.namedItem("mName").value.trim(),
            company: form.elements.namedItem("mCompany").value.trim(),
            releaseDate: form.elements.namedItem("mReleaseDt").value.trim(),
            description: form.elements.namedItem("mDesc").value.trim(),
        };
        var isValid = validateNewData( newPhone );
        if( isValid ) {
            newPhone.id = new Date().getTime();
            console.log('save to db..');
            handsets.push( newPhone );
            
            window.localStorage.setItem("allHandsets", JSON.stringify( handsets ));

            navigateToSearch();
            insertRowsToTable(handsets);
        }
	}
}

function validateNewData( newData ) {
    var errMsgElem = document.getElementById("errMsg");
    if( !(newData.name && newData.company && newData.description) ) {
        if( errMsgElem ){
            errMsgElem.style.display = '';
            errMsgElem.innerHTML = 'fields marked with <span style="color: red">*</span> are mandatory !';
        }
        return false;
    }

    if( errMsgElem ){
        errMsgElem.style.display = 'none';
        errMsgElem.innerHTML = '';
    }
    return true;
}

var onsearchEnter = function(){// TODO: not optimized yet
    var searchElem = document.getElementById("searchInp");
    var searchFor = '';
    if( searchElem ){
        searchFor =  searchElem.value.trim();
        if( !searchFor || searchFor == '' ) {
            insertRowsToTable(handsets);
            return ;
        }
    } else {
        return ;        
    }
	
    var filterData = searchForString( searchFor );
    paging.currentData = filterData;
    paging.totalRecords = paging.currentData.length;
    paging.totalPages = Math.ceil( paging.currentData.length / paging.pageSize );
    insertRowsToTable(filterData);
    
    
}

function searchForString(searchFor) {// TODO: bug on 2nd time search -- solved
    searchFor = searchFor.toLowerCase();
    var results = {};
    var data = handsets;
    for (var i = 0; i < data.length; i++) {
        for (var key in data[i]) {
            if (key != 'id' && data[i][key].toLowerCase().indexOf(searchFor) != -1) {
                results[data[i].id] = data[i];
            }
        }
    }
    var ret = [];
    for(var key in results){
        ret.push(results[key]);
    }
    return ret;
}

function insertRowsToTable( totalRecords ) {
    document.getElementById("pageNo").innerHTML = paging.pageNo;
    document.getElementById("totalCnt").innerHTML = totalRecords.length;
    var dataRows = totalRecords;
    var fromIndex = (paging.pageNo - 1) * paging.pageSize;
    var toIndex = fromIndex + paging.pageSize;
    paging.currPageData = dataRows.slice(fromIndex, toIndex);// not including toIndex

    createTable();
}

function createTable(){
    var table = document.getElementById("displayTable");
    if (!table) {
        return;
    }
    while (table.rows.length > 2) {
        table.deleteRow( -1 );
    }

    paging.currPageData.forEach(function (item, index) {
        var row = table.insertRow(-1);
        row.style["line-height"] = "40px";
        row.style["margin"] = "4px";
        var cellPos = 0;
        for (var prop in item) {
            if (typeof (item) == 'object' && item.hasOwnProperty(prop) && prop != 'id') {
                var cell = row.insertCell(cellPos);
                cell.innerHTML = item[prop];
                cell.style["padding"] = "0.8%";
                cellPos++;
            } 
        }
    });
}

   // --------------
function showHideSortOptions( column ) {
    if( column === 'name' ){
        document.getElementById("nameSortDrp").classList.toggle("show");
    }
    else if( column === 'company' ){
        document.getElementById("companySortDrp").classList.toggle("show");
    }
    else if( column === 'date' ){
        document.getElementById("dateSortDrp").classList.toggle("show");
    }
     
}
    
    // --------------

function sortName( sortOrder ) {
    // debugger;
    function asc( a, b ) {
        return (a.name < b.name) ? -1 : 1;
    }

    function desc( a, b ) {
        return (a.name < b.name) ? 1 : -1;
    }

    if( paging.currentData.length > 0 ) {
        paging.currentData.sort( sortOrder == 0 ? asc : desc);
        insertRowsToTable( paging.currentData );
    }

}


function sortByCompanyName( sortOrder ) {
    function asc( a, b ) {
        return (a.company < b.company) ? -1 : 1;
    }

    function desc( a, b ) {
        return (a.company < b.company) ? 1 : -1;
    }

    if( paging.currentData.length > 0 ) {
        paging.currentData.sort( sortOrder == 0 ? asc : desc);
        insertRowsToTable( paging.currentData );
    }

}

function sortByReleaseDate( sortOrder ) {
    function asc( a, b ) {
        debugger;
        var dt1 = new Date(a.releaseDate);
        var dt2 = new Date(b.releaseDate);
        return dt1- dt2;
    }

    function desc( a, b ) {
        var dt1 = new Date(a.releaseDate);
        var dt2 = new Date(b.releaseDate);
        return dt2 - dt1;
    }

    if( paging.currentData.length > 0 ) {
        paging.currentData.sort( sortOrder == 0 ? asc : desc);
        insertRowsToTable( paging.currentData );
    }

}

// init sample data here
function init() {
    handsets = [ // initial sample data
        {
            name: "Samsung Galaxy S7 Edge",
            company: "Samsung",
            releaseDate: "1 Mar 2016",
            description: "Samsung has used an all new Exynos 8890 SoC on the new Galaxy S7 Edge, and there is 4GB of RAM along with 32GB of internal storage. It features an AMOLED display with 2560x1440-pixel resolution, but the screen size has been increased from 5.1 inches to 5.5 inches. This has allowed Samsung to increase the battery size from 2600mAh to 3600mAh, which allows it to offer better battery life. The biggest change in the phone, though, is the new 12MP Dual Pixel camera, which shoots amazing photographs even in low light. All of these combine to make the Samsung Galaxy S7 Edge the best Android phone to buy in India today.",
            id: 1,
        },
        {
            name: "OnePlus 3",
            company: "OnePlus",
            releaseDate: "1 Mar 2016",
            description: "The OnePlus 3 has grabbed the third position on our ‘best phones to buy’ with ease. This Android phone is an all-rounder, and offers the best performance-to-price ratio among the latest flagship Android phones. This is the first time that OnePlus made an all-metal smartphone, and while the phone is reminiscent of the HTC One M9, it is still a good design. The device is powered by Qualcomm Snapdragon 820 SoC and has 6GB of RAM. The 16MP camera on the back does not disappoint either and offers PDAF as well as OIS. Like most latest Android phones, battery life is not that great, but still manages to go on for a whole day on a single charge.",
            id: 2,
        },
        {
            name: "LG G5",
            company: "LG",
            releaseDate: "1 Mar 2016",
            description: "The LG G5 is powered by a Qualcomm Snapdragon 820 SoC. There is 4GB of RAM and 32GB of native storage, along with microSD card support of up to 200GB. The smaller, 5.3-inch display is a delight to look at, and offers 2560x1440-pixel screen resolution. The colours of the display are among the most well-balanced of the latest Android phones. The removable battery is small, but lasts for a day. LG will also be selling various accessories under its Friends ecosystem for the LG G5, including a camera grip with extra battery, an external amplifier and more.",
            id: 3,
        },
        {
            name: "HTC 10",
            company: "HTC",
            releaseDate: "1 Mar 2016",
            description: "The HTC 10 is another great Android phone to look for in the flagship smartphone range. The HTC 10 flaunts the suave HTC design, with latest generation hardware to boot. Powered by the Qualcomm Snapdragon 820 SoC, the HTC 10 offers great multi-tasking abilities. The OIS-assisted 12MP UltraPixel rear camera is great to shoot with, and you also get OIS on the front camera. HTC has also mastered the 2K display, and the 5.2-inch LCD5 2K resolution panel looks beautiful from all angles. However, the best part is the audio quality, which gives the best music quality you can get on any Android mobile available for purchase today.",
            id: 4,
        },
        {
            name: "Xiaomi Mi5",
            company: "Xiaomi",
            releaseDate: "1 Mar 2016",
            description: "Xiaomi’s two-year-long wait for the Mi 5 translated into a massive upgrade over its previous flagship smartphone in India, the Mi 4. Xiaomi has given this Android phone a complete makeover, fusing an incredibly ergonomic body with a glass-and-metal chassis. It has a 5.15-inch display that offers a well-balanced colour gamut and Full HD screen resolution. The device is powered by the Qualcomm Snapdragon 820 SoC, like most other flagship Android phones in India. Only the 3GB RAM-32GB storage variant has been launched in India, but this itself offers fluent performance. The 16MP primary camera has 4-axis OIS, and is very fast. Also, the 3000mAh battery should last you through the entire work day, comfortably.",
            id: 5,
        },
        {
            name: "Xiaomi Mi5",
            company: "Xiaomi",
            releaseDate: "1 Mar 2016",
            description: "Xiaomi’s two-year-long wait for the Mi 5 translated into a massive upgrade over its previous flagship smartphone in India, the Mi 4. Xiaomi has given this Android phone a complete makeover, fusing an incredibly ergonomic body with a glass-and-metal chassis. It has a 5.15-inch display that offers a well-balanced colour gamut and Full HD screen resolution. The device is powered by the Qualcomm Snapdragon 820 SoC, like most other flagship Android phones in India. Only the 3GB RAM-32GB storage variant has been launched in India, but this itself offers fluent performance. The 16MP primary camera has 4-axis OIS, and is very fast. Also, the 3000mAh battery should last you through the entire work day, comfortably.",
            id: 6,
        },
        {
            name: "Huawei P9",
            company: "Huawei",
            releaseDate: "1 Mar 2016",
            description: "The Huawei P9 is a flagship Android phone, and features all the hardware you can expect from a phone in this league, including a brilliant camera. It offers a two-camera setup with Leica-certified SUMMARIT lenses, which facilitates shooting the best ‘bokeh’ effects available on a latest Android phone. The device is powered by a Kirin 955 SoC, which is not as powerful as the competing Qualcomm Snapdragon 820, but still manages to deliver decent multi-tasking and gaming performance. The Huawei P9 also offers one the best designs and build quality among the latest Android phones.",
            id: 7,
        },
        {
            name: "LeEco Le Max 2",
            company: "LeEco",
            releaseDate: "1 Mar 2016",
            description: "The Le Max 2 might be a slightly larger phone but it is one of most affordable device to offer a flagship class Qualcomm Snapdragon 820 SoC. This LeEco flagship features a bright 2K display with good viewing angles. It can take upon all kinds of tasks and is very well built. To sweeten the deal, LeEco bundles a free subscription of Le Live and Le Vidi apps offering live TV and movie content. Further, the 21MP rear camera does a good job as well, although the battery life could have been better.",
            id: 8,
        },
        {
            name: "Samsung Galaxy Note 5",
            company: "Samsung",
            releaseDate: "1 Mar 2016",
            description: "The Samsung Galaxy Note 5 is another great Android phone, particularly when productivity is concerned. Last year’s Samsung flagship is still one of the fastest Android phones to buy in India. It features a bright, 5.7-inch AMOLED display with 2K screen resolution, offering good viewing angles and S-Pen compatibility. Powered by Samsung’s previous generation Exynos 7420 SoC, the Galaxy Note 5 is still one of the fastest Android phones in the market. The larger footprint allows for a larger battery, and this phone can easily last you for a day, even if you are a power user. The 16MP rear camera is good too, and even offers 4K video recording.",
            id: 9,
        },
        {
            name: "Samsung Galaxy S6",
            company: "Samsung",
            releaseDate: "1 Mar 2016",
            description: "The Samsung Galaxy S6 is a year old now, but still beats a lot of other Android phones to be on this list. It houses an excellent 16MP camera with OIS, and is powered by the Exynos 7420 SoC. The combination of these two factors makes it an excellent overall device. The Galaxy S6 features an excellent 5.1-inch AMOLED display with 2560x1440-pixel resolution. The glass-and-metal construction on this Android phone laid foundation for Samsung’s resurgence on the design front. The Galaxy S6 is available in 32GB and 64GB variants, and 3GB of RAM on board handles all kinds of heavy multitasking, making it rank among the best Android phones to buy in India today.",
            id: 10,
        },
        {
            name: "LG Nexus 5X 32GB",
            company: "LG",
            releaseDate: "1 Mar 2016",
            description: "A successor to the LG Nexus 5, the Nexus 5X offers all the joys of using a Nexus smartphone. This Android phone sports a 5.2-inch Full HD IPS display with good colour accuracy and sharpness. It is powered by a Qualcomm Snapdragon 808 SoC that provides stable performance, and the Android mobile is available in two storage variants – 16GB and 32GB (we suggest you go for the 32GB variant). In the camera department, the Nexus 5X features a similar setup as the Nexus 6P - a 12.3MP primary camera module with laser-assisted autofocus.",
            id: 11,
        },
        {
            name: "Lenovo Z2 Plus",
            company: "Lenovo",
            releaseDate: "1 Mar 2016",
            description: "The Indian smartphone market is very price sensitive. We like good phones with formidable performance at low prices and nothing does it better than the Lenovo Z2 Plus. With a powerful Qualcomm Snapdragon 820 on-board, the Z2 Plus overpowers the competition very easily. To further strengthen its position, Lenovo offers it with 4GB of RAM and 64GB of storage, making it the best phone in the category. The smaller 5-inch touchscreen offers good colour reproduction and so does the 13MP rear camera. So, if you are looking for a phone under 20K, this is it.",
            id: 12,
        },
        {
            name: "OnePlus 2",
            company: "OnePlus",
            releaseDate: "1 Mar 2016",
            description: "The OnePlus 2 is the second flagship premium Android smartphone from OnePlus. It runs on Snapdragon 810 SoC (processor) along with 4GB RAM. OnePlus 2 has a 5.5-inch 1080p screen protected by Gorilla Glass 3. The phone comes with 64GB of onboard storage but does not offer an SD card slot. OnePlus 2 has a 13MP rear camera with Optical Image Stabilization (OIS) along with a laser assisted autofocus system. In terms of front facing selfie camera, OnePlus 2 offers a 5MP front camera.",
            id: 13,
        },
        {
            name: "Vivo V3 Max",
            company: "Vivo",
            releaseDate: "1 Mar 2016",
            description: "The phone is 7.6-mm thin , and tips the scale at 168 grams. The phone is powered by a 1.8 GHz Octa core Qualcomm Snapdragon 652 processor and it comes with 4 GB of RAM. What this means is the processor has Octa cores in the CPU and 4 GB of RAM ensures the phone runs smoothly with multiple applications open simultaneously. The Vivo V3 Max also packs in a graphics processor, and 32 GB of internal storage which can be expanded to 128 GB via a microSD card.",
            id: 14,
        }
    ];
    console.log( '  --  ', window.Storage ); 
    if( !( window.localStorage.getItem("allHandsets") ) ){
        window.localStorage.setItem("allHandsets", JSON.stringify( handsets ));
    } else {
        paging.currentData = handsets = JSON.parse( window.localStorage.getItem("allHandsets") );
    }

    paging.totalRecords = handsets.length;
    paging.totalPages = Math.ceil( handsets.length / paging.pageSize );
}
init();