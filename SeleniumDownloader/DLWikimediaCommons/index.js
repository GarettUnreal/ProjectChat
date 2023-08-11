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
    "Pizza": "https://commons.wikimedia.org/wiki/File:Pizza_(25569353288).jpg",
    "Spaghetti": "https://commons.wikimedia.org/wiki/File:Spaghetti2.jpg",
    "Lobster roll": "https://commons.wikimedia.org/wiki/File:Maine_Lobster_Roll_(15506681328).jpg",
    "Gyros": "https://commons.wikimedia.org/wiki/File:Pita_giros.JPG",
    "Tiramisu": "https://commons.wikimedia.org/wiki/File:Classic_Italian_Tiramisu-3_(29989504485).jpg",
    "Cheesecake": "https://commons.wikimedia.org/wiki/File:Baked_cheesecake_with_raspberries_and_blueberries.jpg",
    "Ramen": "https://commons.wikimedia.org/wiki/File:Yeul_Ramen_20210817_002.jpg",
    "Paella": "https://commons.wikimedia.org/wiki/File:01_Paella_Valenciana_original.jpg",
    "Bibimbap": "https://commons.wikimedia.org/wiki/File:Bibimbap_at_Micun_Bibimbap,_CapitaMall_Crystal_(20211212122041).jpg",
    "Croissant": "https://commons.wikimedia.org/wiki/File:Croissant_in_black_background.png",
    "Pancakes": "https://commons.wikimedia.org/wiki/File:Pancake_stack_4.jpg",
    "Caesar salad": "https://commons.wikimedia.org/wiki/File:Caesar_salad_(1).jpg",
    "Eclairs": "https://commons.wikimedia.org/wiki/File:Eclair_with_a_fork.jpg",
    "Fajitas": "https://commons.wikimedia.org/wiki/File:Chicken_fajitas_-_La_Hacienda_-_Sarah_Stierch.jpg",
    "Gnocchi": "https://commons.wikimedia.org/wiki/File:Gnocchi_di_ricotta_burro_e_salvia.jpg",
    "Churros": "https://commons.wikimedia.org/wiki/File:Churros_en_vasos_en_Londres_-_A_Taste_of_Spain.jpg",
    "Samosas": "https://commons.wikimedia.org/wiki/File:Vegetarian_Samosa.jpg",
    "Macarons": "https://commons.wikimedia.org/wiki/File:Macarons,_French_made_mini_cakes.JPG",
    "Dim sum": "https://commons.wikimedia.org/wiki/File:Dim_Sum_Breakfast.jpg",
    "Apple pie": "https://commons.wikimedia.org/wiki/File:Apple_pie.jpg",
    "Sacher torte": "https://commons.wikimedia.org/wiki/File:Original_sacher_torte.jpg",
    "Beignets": "https://commons.wikimedia.org/wiki/File:Beignets_2.jpg",
    "Falafel": "https://commons.wikimedia.org/wiki/File:Bowl_of_falafel.jpg",
    "Ratatouille": "https://commons.wikimedia.org/wiki/File:Ratatouille,_Mazatl%C3%A1n,_21_de_junio_de_2023_02.jpg",
    "Chocolate mousse": "https://commons.wikimedia.org/wiki/File:Chocolate_Mousse.jpg"
  });