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
    "Eagle": "https://commons.wikimedia.org/wiki/File:Kaiseradler_Aquila_heliaca_2_amk.jpg",
    "Flamingo": "https://commons.wikimedia.org/wiki/File:American_flamingo_(Phoenicopterus_ruber).JPG",
    "Penguin": "https://commons.wikimedia.org/wiki/File:Pygoscelis_papua.jpg",
    "Hummingbird": "https://commons.wikimedia.org/wiki/File:Archilochus-alexandri-002-edit.jpg",
    "Pelican": "https://commons.wikimedia.org/wiki/File:Pelecanus_onocrotalus_-_Great_White_Pelican,_Adana_2016-12-18_01-3.jpg",
    "Parrot": "https://commons.wikimedia.org/wiki/File:Parrot_4.jpg",
    "Swan": "https://commons.wikimedia.org/wiki/File:CygneVaires.jpg",
    "Albatross": "https://commons.wikimedia.org/wiki/File:Short_tailed_Albatross1.jpg",
    "Blue Jay": "https://commons.wikimedia.org/wiki/File:Blue_jay_in_PP_(30960).jpg",
    "Cardinal": "https://commons.wikimedia.org/wiki/File:Male_northern_cardinal_in_Prospect_Park.jpg",
    "Woodpecker": "https://commons.wikimedia.org/wiki/File:Black_woodpecker_(Dryocopus_martius).jpg",
    "Robin": "https://commons.wikimedia.org/wiki/File:European_robin_on_a_branch.jpg",
    "Toucan": "https://commons.wikimedia.org/wiki/File:Toucan_Parque-das-Aves.jpg",
    "Kingfisher": "https://commons.wikimedia.org/wiki/File:Common_Kingfisher_Alcedo_atthis.jpg",
    "Puffin": "https://commons.wikimedia.org/wiki/File:Puffin_(Fratercula_arctica).jpg",
    "Emu": "https://commons.wikimedia.org/wiki/File:Dromaius_novaehollandiae_-_02.jpg",
    "Kiwi": "https://commons.wikimedia.org/wiki/File:TeTuatahianui.jpg",
    "Vulture": "https://commons.wikimedia.org/wiki/File:White-rumped_vulture_(Gyps_bengalensis)_Photograph_by_Shantanu_Kuveskar.jpg",
    "Snowy Owl": "https://commons.wikimedia.org/wiki/File:Schneeeule_Bubo_scandiacus_Grugapark_2013.jpg",
    "Bald Eagle": "https://commons.wikimedia.org/wiki/File:Weisskopf_Seeadler_haliaeetus_leucocephalus_8_amk.jpg",
    "Golden Pheasant": "https://commons.wikimedia.org/wiki/File:Chrysolophus_pictus_-_Maroparque_01.jpg",
    "Cockatoo": "https://commons.wikimedia.org/wiki/File:Cockatoo.1.arp.500pix.jpg",
    "Macaw": "https://commons.wikimedia.org/wiki/File:Macaw_Parque-des-Aves.jpg",
    "Hawk": "https://commons.wikimedia.org/wiki/File:Hawk_at_Milwaukee_Zoo.JPG",
    "Gull": "https://commons.wikimedia.org/wiki/File:Gull_4908.jpg",
    "Magpie": "https://commons.wikimedia.org/wiki/File:Common_magpie_(Pica_pica).jpg",
    "Cuckoo": "https://commons.wikimedia.org/wiki/File:Common_cuckoo_(Cuculus_canorus).jpg",
    "Cormorant": "https://commons.wikimedia.org/wiki/File:Great_cormorant_on_a_rock.jpg",
    "Tern": "https://commons.wikimedia.org/wiki/File:Common_tern_landing_on_a_branch.jpg",
    "Finch": "https://commons.wikimedia.org/wiki/File:Fringilla_coelebs_chaffinch_male_edit2.jpg",
    "Sparrow": "https://commons.wikimedia.org/wiki/File:House_sparrow_male_in_Prospect_Park_(53532).jpg",
    "Peacock": "https://commons.wikimedia.org/wiki/File:Paonroue.JPG",
    "Ibis": "https://commons.wikimedia.org/wiki/File:Threskiornis_aethiopicus_-Mida_Creek_mud_flats,_Kenya-8.jpg",
    "Quetzal": "https://commons.wikimedia.org/wiki/File:Quetzal01.jpg",
    "Raven": "https://commons.wikimedia.org/wiki/File:Common_Raven_at_West_Yellowstone.jpg",
    "Dove": "https://commons.wikimedia.org/wiki/File:Rock_dove_-_natures_pics.jpg",
    "Hornbill": "https://commons.wikimedia.org/wiki/File:Great_hornbill_Photograph_by_Shantanu_Kuveskar.jpg",
    "Parakeet": "https://commons.wikimedia.org/wiki/File:Blue_australian_parakeet.jpg",
    "Starling": "https://commons.wikimedia.org/wiki/File:Lamprotornis_hildebrandti_-Tanzania-8-2c.jpg",
    "Gannet": "https://commons.wikimedia.org/wiki/File:Morus_bassanus_adu.jpg"
  });