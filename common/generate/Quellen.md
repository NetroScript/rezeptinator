

# Zutaten

Von https://www.bmi-rechner.net/kalorientabelle.htm


mithilfe des folgenden Codes für z.B. obstgemüse:

```JavaScript
$("#kalorientabelle tbody tr").toArray().map(element => {
    let el = $(element);
    let types = ["name", "kalorien", "eiweiß", "fett", "kohlenhydrate", "zucker", "ballaststoffe", "alkohol"]
    let data = {} 
    types.forEach((type, index)=>{
      data[type] = (type == "name") ? $(el.children()[index]).text() : parseFloat($(el.children()[index]).text()) 
    })

    data["vegan"] = "vegan"
    ​
    return data
})

```


Da manche von diesen sachen in 100ml statt 100g angegeben sind, kann es leichte abweichungen geben, das sollte
 jedoch kein Problem sein
 
 
 
 
 
 
 
 
 Eventuelle weitere Quelle:
 https://github.com/pinae/Nutria-DB/blob/master/nutriaDB/jsonAPI/fixtures/knappe_rezepte.json
 
 
 # Allergien
 
 https://www.bzfe.de/inhalt/allergenkennzeichnung-1878.html
 https://www.nestleprofessional.de/news/ernaehrung/allergenliste-die-14-hauptallergengruppen-im-ueberblick