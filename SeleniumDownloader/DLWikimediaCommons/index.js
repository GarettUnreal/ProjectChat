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
  "Sandra Bullock": "https://commons.wikimedia.org/wiki/File:Sandra_Bullock_(9189702847).jpg",
  "Meryl Streep": "https://commons.wikimedia.org/wiki/File:Meryl_Streep_December_2018.jpg",
  "Nicole Kidman": "https://commons.wikimedia.org/wiki/File:Nicole_Kidman_-_Berlin_2015.png",
  "Natalie Portman": "https://commons.wikimedia.org/wiki/File:Natalie_Portman_Cannes_2015_5.jpg",
  "Chris Pratt": "https://commons.wikimedia.org/wiki/File:Chris_Pratt_2018.jpg",
  "Julia Roberts": "https://commons.wikimedia.org/wiki/File:Julia_Roberts_2011_Shankbone_3.JPG",
  "Denzel Washington": "https://commons.wikimedia.org/wiki/File:Denzel_Washington_2018.jpg",
  "Benedict Cumberbatch": "https://commons.wikimedia.org/wiki/File:Benedict_Cumberbatch_TIFF_2017.jpg",
  "Viola Davis": "https://commons.wikimedia.org/wiki/File:Viola_Davis_June_2015.jpg",
  "Anthony Hopkins": "https://commons.wikimedia.org/wiki/File:AnthonyHopkins10TIFF.jpg",
  "Daniel Craig": "https://commons.wikimedia.org/wiki/File:Daniel_Craig_Millennium_Paris_2012.jpg",
  "Naomi Watts": "https://commons.wikimedia.org/wiki/File:Naomi_Watts_(36037832511)_(cropped).jpg",
  "Cameron Diaz": "https://commons.wikimedia.org/wiki/File:Cameron_Diaz_Berlin_2014.jpg",
  "Jeremy Renner": "https://commons.wikimedia.org/wiki/File:Jeremy_Renner_6,_2013.jpg",
  "Elton John": "https://commons.wikimedia.org/wiki/File:Elton_John_2011_Shankbone_2_(cropped).JPG",
  "Paul McCartney": "https://commons.wikimedia.org/wiki/File:Paul_McCartney_in_October_2018.jpg",
  "Snoop Dogg": "https://commons.wikimedia.org/wiki/File:Snoop_crop.jpg",
  "Pharrell Williams": "https://commons.wikimedia.org/wiki/File:Pharrell_Williams_at_The_Lion_King_European_Premiere_2019.png",
  "Penélope Cruz": "https://commons.wikimedia.org/wiki/File:Pen%C3%A9lope_Cruz_and_Katrina_Bayonas_(cropped).jpg",
  "Javier Bardem": "https://commons.wikimedia.org/wiki/File:Javier_Bardem_2011_AA.jpg",
  "Usher": "https://commons.wikimedia.org/wiki/File:Usher_Cannes_2016_retusche.jpg",
  "Bono": "https://commons.wikimedia.org/wiki/File:Bono_November_2014.jpg",
  "Pink": "https://commons.wikimedia.org/wiki/File:Pink_2019-07-27_Munich_(cropped).jpg",
  "Drew Barrymore": "https://commons.wikimedia.org/wiki/File:Drew_Barrymore_Berlin_2014.jpg",
  "Sigourney Weaver": "https://commons.wikimedia.org/wiki/File:Sigourney_Weaver_by_Gage_Skidmore.jpg",
  "Helen Mirren": "https://commons.wikimedia.org/wiki/File:Helen_Mirren-2208_(cropped).jpg",
  "Kevin Spacey": "https://commons.wikimedia.org/wiki/File:Kevin_Spacey,_May_2013_(cropped).jpg",
  "Ian McKellen": "https://commons.wikimedia.org/wiki/File:Ian_McKellen_-_1-3_(cropped).jpg",
  "Steve Carell": "https://commons.wikimedia.org/wiki/File:Steve_Carell_Cannes_2014.jpg",
  "Tina Fey": "https://commons.wikimedia.org/wiki/File:Tina_Fey_by_David_Shankbone.jpg",
  "Kristen Wiig": "https://commons.wikimedia.org/wiki/File:Kristen_Wiig_TIFF_2014.jpg",
  "Alec Baldwin": "https://commons.wikimedia.org/wiki/File:Alec_Baldwin_(28246306070)_(cropped).jpg",
  "Harrison Ford": "https://commons.wikimedia.org/wiki/File:Harrison_Ford_Cannes.jpg",
  "Reese Witherspoon": "https://commons.wikimedia.org/wiki/File:Reese_Witherspoon,_2009_cropped.jpg",
  "Zooey Deschanel": "https://commons.wikimedia.org/wiki/File:Zooey_Deschanel_May_2014_(cropped).png"
});