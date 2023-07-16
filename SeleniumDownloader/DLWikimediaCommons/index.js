const {Builder, By, Key, util} = require("selenium-webdriver");
async function example() {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://commons.wikimedia.org/wiki/List_of_dog_breeds");
    var tableRows = await driver.findElements(By.xpath('//*[@id="mw-content-text"]/div[2]/table[2]/tbody/tr[*]'));
    console.log("Num Table Rows = " + tableRows.length);
    var outputObj = {};
    for(var i = 0; i < tableRows.length; i++)
    {

        if(i > 2)
        {
            break;
        }

        var clickedIntoImage = false;
        var attributionText = "";
        var fileURL = "";
        var fileSize = 0;
        try
        {
            var linkElem = await tableRows[i].findElement(By.css("th")).findElement(By.css("a"));
            var link = await linkElem.getAttribute("href");
            await driver.get(link);
            clickedIntoImage = true;
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

            await driver.sleep(1000);
        }
        catch(err)
        {
            console.log("Index = " + i + ", error = " + err);
        }

        if(clickedIntoImage)
        {
            await driver.navigate().back();
            await driver.sleep(1000);
        }
        clickedIntoImage = false;

        var tableRows = await driver.findElements(By.xpath('//*[@id="mw-content-text"]/div[2]/table[2]/tbody/tr[*]'));
        var tdElems = await tableRows[i].findElements(By.css("td"));
        var nameElem = await tdElems[2].findElement(By.css("span"));
        var name = await nameElem.getText();
        //console.log("Index = " + i + ", name = " + name + ", attribution = " + attributionText + ", link = " + link + ".");
        if(fileURL !== "")
        {
            outputObj[name] = { "URL": fileURL, "Attribution": attributionText };
        }
    }
    console.log(JSON.stringify(outputObj, null, 2));
    //await driver.findElement(By.name("q")).sendKeys("Selenium", Key.RETURN);
}
example();