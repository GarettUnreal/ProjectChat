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
    "Euler's Identity": "https://commons.wikimedia.org/wiki/File:VignetteEulerIdentity.svg",
    "Fibonacci Sequence": "https://commons.wikimedia.org/wiki/File:PascalTriangleFibanacci.svg",
    "Newton's Law of Universal Gravitation": "https://commons.wikimedia.org/wiki/File:Newton_s_law_of_universal_gravitation.svg",
    "Golden Ratio": "https://commons.wikimedia.org/wiki/File:Golden_ratio_segments.png",
    "Quadratic formula": "https://commons.wikimedia.org/wiki/File:Quadratic_formula.svg",
    "The Fundamental Theorem of Calculus": "https://commons.wikimedia.org/wiki/File:Fundamental_Theorem_of_Calculus.svg",
    "Bayes' Theorem": "https://commons.wikimedia.org/wiki/File:Bayes%27_Theorem_MMB_01.jpg",
    "Chaos Theory": "https://commons.wikimedia.org/wiki/File:Lorenz_system_r28_s10_b2-6666.png",
    "Prime Numbers": "https://commons.wikimedia.org/wiki/File:Primencomposite0100.svg",
    "Pascal's Triangle": "https://commons.wikimedia.org/wiki/File:Pascal%27s_triangle_5.svg",
    "Riemann Hypothesis": "https://commons.wikimedia.org/wiki/File:Riemann_hypothesis_caimi.svg",
    "Fermat's Last Theorem": "https://commons.wikimedia.org/wiki/File:Czech_stamp_2000_m259.jpg",
    "Pythagorean Theorem": "https://commons.wikimedia.org/wiki/File:Pythagorean.svg",
    "Drake Equation": "https://commons.wikimedia.org/wiki/File:Europa_Rising_-_Drake_Equation_(14486519161).jpg",
    "Tower of Hanoi": "https://commons.wikimedia.org/wiki/File:Tower_of_Hanoi.jpeg",
    "Schrödinger Equation": "https://commons.wikimedia.org/wiki/File:Schrodinger_Equation.png",
    "Gömböc": "https://commons.wikimedia.org/wiki/File:Gomboc2.jpg",
    "Mobius Strip": "https://commons.wikimedia.org/wiki/File:M%C3%B6bius_strip.jpg",
    "Mandelbrot Set": "https://commons.wikimedia.org/wiki/File:Mandelbrot_20210411_007.png",
    "The Koch Snowflake": "https://commons.wikimedia.org/wiki/File:Koch_Snowflake_7th_iteration.png"
  });