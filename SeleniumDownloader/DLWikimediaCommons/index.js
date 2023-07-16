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
	"Blender": "https://commons.wikimedia.org/wiki/File:ElectricBlender.jpg",
	"Food processor": "https://commons.wikimedia.org/wiki/File:Food_Processor_2.jpg",
	"Stand mixer": "https://commons.wikimedia.org/wiki/File:Stand_Mixer_icon.png",
	"Espresso machine": "https://commons.wikimedia.org/wiki/File:(Zerdo,_Quito)_(espresso_machine_at_the_bar).jpg",
	"Slow cooker": "https://commons.wikimedia.org/wiki/File:6_quart_Crock_Pot_slow_cooker.jpg",
	"Air fryer": "https://commons.wikimedia.org/wiki/File:Air_Fryer_Presets.jpg",
	"Electric kettle": "https://commons.wikimedia.org/wiki/File:General_electric_-_electric_water_kettle.jpg",
	"Rice cooker": "https://commons.wikimedia.org/wiki/File:Rice_cooker_(240031398).jpg",
	"Juicer": "https://commons.wikimedia.org/wiki/File:Hurom_juicer3.jpg",
	"Pressure cooker": "https://commons.wikimedia.org/wiki/File:Pressure_cooker_oval_lid.jpg",
	"Waffle maker": "https://commons.wikimedia.org/wiki/File:Waffle_Iron_(PSF).png",
	"Bread Maker": "https://commons.wikimedia.org/wiki/File:Making_bread_in_bread_machine.jpg",
	"Toaster oven": "https://commons.wikimedia.org/wiki/File:Hamilton_Beach_Easy_Reach_Sure-Crisp_Toaster_Oven_-_Door_Open.jpg",
	"Electric grill": "https://commons.wikimedia.org/wiki/File:Asador_electrico.JPG",
	"Immersion blender": "https://commons.wikimedia.org/wiki/File:Ty%C4%8Dov%C3%BD_mix%C3%A9r_Bosch_01.jpg",
	"Hand Mixer": "https://commons.wikimedia.org/wiki/File:Viking_5-Speed_Hand_Mixer_(4695735699).jpg",
	"Coffee grinder": "https://commons.wikimedia.org/wiki/File:Coffee_grinder_blades.jpg",
	"Electric can opener": "https://commons.wikimedia.org/wiki/File:Proctor_Silex_Electric_Can_Opener.JPG"
});