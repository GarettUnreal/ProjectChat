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
    "Garlic press": "https://commons.wikimedia.org/wiki/File:Klieste_na_cesnak.jpg",
    "Mortar and pestle": "https://commons.wikimedia.org/wiki/File:Mortar_and_pestle_used_for_grinding_pigments.jpg",
    "Rolling pin": "https://commons.wikimedia.org/wiki/File:Nudelholz.jpg",
    "Peeler": "https://commons.wikimedia.org/wiki/File:Peeler_02_Pengo.jpg",
    "Mandoline": "https://commons.wikimedia.org/wiki/File:Cooking_Mandolin_with_Carrot.jpg",
    "Nutcracker": "https://commons.wikimedia.org/wiki/File:Casse-noix_inox_04.jpg",
    "Colander": "https://commons.wikimedia.org/wiki/File:Plastic_Colander.jpg",
    "Sieve": "https://commons.wikimedia.org/wiki/File:Sieve.jpg",
    "Cheese knife": "https://commons.wikimedia.org/wiki/File:Cheese_knife.JPG",
    "Oyster knife": "https://commons.wikimedia.org/wiki/File:Oyster_knife_DSC09237.jpg",
    "Honing steel": "https://commons.wikimedia.org/wiki/File:Cucina_009_retouched.jpg",
    "Measuring spoons": "https://commons.wikimedia.org/wiki/File:MeasuringSpoons.jpg",
    "Measuring cups": "https://commons.wikimedia.org/wiki/File:Measuring_cups_(%C2%BC,_%C2%BD,_1_cup).jpg",
    "Potato ricer": "https://commons.wikimedia.org/wiki/File:Potatispress.JPG",
    "Salad spinner": "https://commons.wikimedia.org/wiki/File:Slacentrifuge.jpg",
    "Herb scissors": "https://commons.wikimedia.org/wiki/File:Kr%C3%A4uterschere-0836.jpg",
    "Pepper mill": "https://commons.wikimedia.org/wiki/File:Peugeot_pepper_mill.jpg",
    "Gnocchi board": "https://commons.wikimedia.org/wiki/File:Starr-170216-6930-Samanea_saman-gnocchi_board-Hawea_Pl_Olinda-Maui_(32566657593).jpg",
    "Bottle opener": "https://commons.wikimedia.org/wiki/File:Opener,_bottle_(AM_2014.56.36-1).jpg",
    "Cherry pitter": "https://commons.wikimedia.org/wiki/File:Cherry-pitter-1.jpg",
    "Butter curler": "https://commons.wikimedia.org/wiki/File:Curler,_butter_(AM_70571-1).jpg",
    "Espresso tamper": "https://commons.wikimedia.org/wiki/File:Cobalt_ray-tracing,_high-end_coffee_tamper.jpg",
    "Ice pick": "https://commons.wikimedia.org/wiki/File:ICEPICK2.jpg",
    "Sugar tongs": "https://commons.wikimedia.org/wiki/File:Sugar_Tongs_MET_72911.jpg",
    "Asparagus tongs": "https://commons.wikimedia.org/wiki/File:Asparagus_tongs_MET_183254.jpg",
    "Baster": "https://commons.wikimedia.org/wiki/File:Baster.jpg",
    "Apple corer": "https://commons.wikimedia.org/wiki/File:Apple_Corer.jpg"
  });