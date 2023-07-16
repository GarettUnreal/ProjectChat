const {Builder, By, Key, util} = require("selenium-webdriver");

async function getImageInfo(link, driver) {
    
    var attributionText = "";
    var fileURL = "";
    try
    {
        await driver.get(link);
        await driver.sleep(1000);
        var DownloadElem = await driver.findElement(By.xpath("//a[text()='Download']"));
        DownloadElem.click();
        await driver.sleep(500);
        var attributionElem = await driver.findElement(By.id("stockphoto_attribution"));
        attributionText = await attributionElem.getAttribute("value");

        var fullRestElem = await driver.findElement(By.xpath("//a[text()='Full resolution']"));
        try
        {
            var fiveElem = await driver.findElement(By.xpath("//a[text()='512px']"));
            fileURL = await fiveElem.getAttribute("href");
        }
        catch(err)
        {
            try
            {
                var twoElem = await driver.findElement(By.xpath("//a[text()='256px']"));
                fileURL = await twoElem.getAttribute("href");
            }
            catch(err2)
            {
                try
                {
                    var fullResElem = await driver.findElement(By.xpath("//a[text()='Full resolution']"));
                    fileURL = await fullResElem.getAttribute("href");
                }
                catch(err4)
                {
                    console.log("Could not find any file URL for " + link);
                }
            }
        }
    }
    catch(err)
    {
        console.log('Failed to get image info for link = ' + link);
        return null;
    }

    return { "URL": fileURL, "Attribution": attributionText }
}

async function printImageInfos(NamedImages)
{
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://commons.wikimedia.org/wiki");
    await driver.sleep(1000);
    var outputObj = {};
    for(const [name, link] of Object.entries(NamedImages))
    {
        var imageInfo = await getImageInfo(link, driver);
        if(imageInfo != null)
        {
            outputObj[name] = imageInfo;
        }
        await driver.sleep(1000);
    }
    console.log(JSON.stringify(outputObj, null, 2));
}

async function example() {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://commons.wikimedia.org/wiki/List_of_dog_breeds");
    //var tableRows = await driver.findElements(By.xpath('//*[@id="mw-content-text"]/div[2]/table[2]/tbody/tr[*]'));
    //console.log("Num Table Rows = " + tableRows.length);
    var outputObj = {};
    var tableRowIndex = 1;
    var tableRow = null;
    var name = ""
    while(true)
    {
        /*if(tableRowIndex > 3)
        {
            break;
        }*/

        try
        {
            
            tableRow = await driver.findElement(By.xpath('//*[@id="mw-content-text"]/div[2]/table[2]/tbody/tr[' + tableRowIndex + ']'));
        }
        catch(err)
        {
            console.log('//*[@id="mw-content-text"]/div[2]/table[2]/tbody/tr[' + tableRowIndex + ']');
            console.log('Last valid table row at index = ' + tableRowIndex + '.');
            break;
        }
        var clickedIntoImage = false;
        var attributionText = "";
        var fileURL = "";
        var fileSize = 0;
        try
        {
            var tdElems = await tableRow.findElements(By.css("td"));
            var nameElem = await tdElems[2].findElement(By.css("span"));
            name = await nameElem.getText();
            var linkElem = await tableRow.findElement(By.css("th")).findElement(By.css("a"));
            var link = await linkElem.getAttribute("href");
            await driver.get(link);
            clickedIntoImage = true;
            await driver.sleep(500);
            var DownloadElem = await driver.findElement(By.xpath("//a[text()='Download']"));
            DownloadElem.click();
            await driver.sleep(500);
            var attributionElem = await driver.findElement(By.id("stockphoto_attribution"));
            attributionText = await attributionElem.getAttribute("value");

            var fullRestElem = await driver.findElement(By.xpath("//a[text()='Full resolution']"));
            try
            {
                var fiveElem = await driver.findElement(By.xpath("//a[text()='512px']"));
                fileURL = await fiveElem.getAttribute("href");
            }
            catch(err)
            {
                try
                {
                    var twoElem = await driver.findElement(By.xpath("//a[text()='256px']"));
                    fileURL = await twoElem.getAttribute("href");
                }
                catch(err2)
                {
                    try
                    {
                        var fullResElem = await driver.findElement(By.xpath("//a[text()='Full resolution']"));
                        fileURL = await fullResElem.getAttribute("href");
                    }
                    catch(err4)
                    {
                        console.log("Could not find any file URL for " + link);
                    }
                }
            }

            await driver.sleep(500);
        }
        catch(err)
        {
            console.log("Index = " + tableRowIndex + ", error = " + err);
        }

        if(clickedIntoImage)
        {
            await driver.navigate().back();
            await driver.sleep(500);
        }
        clickedIntoImage = false;

        //console.log("Index = " + i + ", name = " + name + ", attribution = " + attributionText + ", link = " + link + ".");
        if(fileURL !== "")
        {
            outputObj[name] = { "URL": fileURL, "Attribution": attributionText };
        }
        fileURL = name = attributionText = "";
        tableRowIndex++;
    }
    console.log(JSON.stringify(outputObj, null, 2));
    //await driver.findElement(By.name("q")).sendKeys("Selenium", Key.RETURN);
}
//example();

printImageInfos({
	"Spatula": "https://commons.wikimedia.org/wiki/File:Spatula_II.JPG",
	"Wooden spoon": "https://commons.wikimedia.org/wiki/File:Wooden_Spoon.jpg",
	"Whisk": "https://commons.wikimedia.org/wiki/File:Whisk_Ball_03.jpg",
	"Tongs": "https://commons.wikimedia.org/wiki/File:Tongs_for_serving_food.jpg",
	"Ladle": "https://commons.wikimedia.org/wiki/File:Ladle.jpg",
	"Slotted spoon": "https://commons.wikimedia.org/wiki/File:Cuiller_%C3%A0_trous_04.jpg",
	"Serving fork": "https://commons.wikimedia.org/wiki/File:Serving_fork_MET_143236.jpg",
	"Potato masher": "https://commons.wikimedia.org/wiki/File:Kartoffelstampfer_2015.jpg",
	"Cake server": "https://commons.wikimedia.org/wiki/File:1024_Tortenheber-2791.jpg",
	"Meat tenderizer": "https://commons.wikimedia.org/wiki/File:Meat-Tenderizer.jpg",
	"Pizza cutter": "https://commons.wikimedia.org/wiki/File:Pizza-slicer.jpg",
	"Cheese grater": "https://commons.wikimedia.org/wiki/File:Cheese_grater.png",
	"Ice cream scoop": "https://commons.wikimedia.org/wiki/File:IceCreamScoop.jpg",
	"Can opener": "https://commons.wikimedia.org/wiki/File:Kitchen-Modern-Can-Opener.jpg",
	"Corkscrew": "https://commons.wikimedia.org/wiki/File:Corkscrew_P1150886.jpg",
	"Pastry brush": "https://commons.wikimedia.org/wiki/File:Kitchen-Silicone-Brush.jpg",
	"Melon baller": "https://commons.wikimedia.org/wiki/File:Kugelausstecher_30mm_Durchmesser.jpg",
	"Meat thermometer": "https://commons.wikimedia.org/wiki/File:2008-09-20_Thermometer_reading.jpg",
	"Lemon zester": "https://commons.wikimedia.org/wiki/File:Zester-stainless-steel.jpg",
	"Egg slicer": "https://commons.wikimedia.org/wiki/File:Eierschneider.jpg"
});