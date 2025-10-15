//OPEN / CLOSE POKEDEX
const OpenButton = document.getElementById("openButton"); // Selecciona el botón por su ID
const PokeDexOpen = document.getElementById("open"); // Selecciona la imagen abierta por su ID
const PokeDexClose = document.getElementById("close"); // Selecciona la imagen cerrada por su ID

OpenButton.addEventListener("click" , () => { // Añade un evento de clic al botón
    PokeDexClose.style.display = "none"; // Oculta la imagen cerrada
    PokeDexOpen.style.display = "block"; // Muestra la imagen abierta
    OpenButton.style.display = "none"; // Oculta el botón después de hacer click
});

//Keypad
const KeyPad = document.querySelectorAll(".key"); // Selecciona todos los botones azules que tieien la misma clase, querySelectorAll para seleccionar todos los elementos 
const CodeScreen = document.getElementById("codePokemon"); //Pantalla verde donde se ve el codigo
let code = ""; // Se guarda lo que esribe el usuario, se usa let porque el valor va a cambiar
KeyPad.forEach(button => { //Recorre cada boton azul que le puse el numero, por cada boton
    button.addEventListener("click", () => { // Se añade un click en cada boton para que el codigo lo lea
        const digit = button.getAttribute("data-digit"); //Se obtiene el numero que yo le puse en el html y lo guarda en digit
        code += digit; //Se guarda el data.digit en la variable del usuario
        CodeScreen.textContent = code; //Muestra en la pantalla verde lo que el usuario escribe
    });
});

//Search, Sprites and Evolutions
const SearchButton = document.getElementById("search"); // Botón amarillo
const ImagePokemon = document.getElementById("pokemon"); // Imagen del pokemon

//Guardo los sprites que me dan la API y las evoluciones que quiero moistrar
let Sprites = {}; //Se guardan las URLs de los sprites = vistas del pokemon, uso {} porque es un objeto clave/valor determinado de la API el que me devuelve 
let currentSprite = "front_default"; //Se guarda el sprite que se esta mostrando y se inicia con el front_default
let evolution = []; //Creo un array ya que son mas de 1 las evoluciones de 1 solo pokemon, uso [] porque en la API las evoluciones estan ordenadas como lista anidadas
let current = 0; //Se guarda la evolucion de las varias que hay que se esta mostrando

SearchButton.addEventListener("click", async () => {
    try {
        const responseAPI = await fetch(`${window.ENV.API_URL}/pokemon/${code}`); // Hace la peticion HTTP a la API con el codigo que el usuario escribio, devuelve una promesa
        if (!responseAPI.ok) throw new Error("Pokemon not found"); // Para mejor manejo de errores, si es true (200-299), si es false, hace throw mas filtrado (400-500) y manda al catch
        const dataJ = await responseAPI.json(); // Convierte la respuesta a JSON para lectura

        Sprites = dataJ.sprites; //Guarda la info de la API en el objeto de Sprites filtrado en el .sprites de la API
        currentSprite = "front_default"; //Reseteo el sprite actual a front_default cada vez que busco un pokemon

        ImagePokemon.src = dataJ.sprites.other["official-artwork"].front_default; // Cambia la imagen del pokemon por la que trae la API, uso direccion oficial de la API, se descargan las evoluciones
        ImagePokemon.style.display = "block"; // Muestra la imagen del pokemon

        const specieP = await fetch(dataJ.species.url); // Hace otra peticion HTTP para obtener la especie del pokemon, de donde luego saco la evolucion
        const specieD = await specieP.json(); // Convierte la respuesta a JSON para lectura 
        const evolutionP = await fetch(specieD.evolution_chain.url); // Hace otra peticion HTTP para obtener la cadena de evoluciones del pokemon, otro endpoint y lo guarda en evolutionP
        const evolutionD = await evolutionP.json(); // Convierte la respuesta a JSON para lectura, contiene el JSON de la cadena de evolucion 

        evolution = []; // Limpio el array para llenarlo y lo llamo
        let evo = evolutionD.chain; //Guardo la primera evolucion que en la API esta como chain, que es la base de la cadena de evoluciones
        while (evo) { //Recorro la cadena de evoluciones
            evolution.push(evo.species.name); //Uso push para que al llamar cada evolucion, se haga al final del array y asi no llamar cada vez la API
            evo = evo.evolves_to[0]; //Llamo a la siguiente evolucion, que en la API esta como evolves_to, y uso [0] porque es un array
        } 
        current = 0; // Reseteo la evolucion actual a 0 para que siempre empiece en la primera evolucion, la flecha del 1 lugar se va moviendo

        code = ""; // Limpia el codigo despues de buscar
        CodeScreen.textContent = ""; // Limpia la pantalla verde despues de buscar

        //Muestro la altura y el peso del pokemon
        document.getElementById("heightPokemon").textContent = `Height: ${dataJ.height}`; //Muestra la altura del pokemon
        document.getElementById("weightPokemon").textContent = `Weight: ${dataJ.weight}`; //Muestra el peso del pokemon

        const TypeP = document.getElementById("type"); //Muestra el tipo del pokemon
        const AbilityP = document.getElementById("ability"); //Muestra la habilidad del pokemon
        const weaknessesP = document.getElementById("weaknesses"); //Muestra las debilidades del pokemon

        const types = dataJ.types.map(typeInfo => typeInfo.type.name).join(", "); //Obtengo los tipos del pokemon y los uno en uno string separados por comas, uso map porque el array lo quiero devovler pero transformado
        const abilities = dataJ.abilities.map(abilityInfo => abilityInfo.ability.name).join(", "); //Obtengo las habilidades del pokemon y los uno en uno string separados por comas, uso map porque el array lo quiero devovler pero transformado

        TypeP.textContent = `Type: ${types}`; //Muestra el tipo del pokemon
        AbilityP.textContent = `Ability: ${abilities}`; //Muestra la habilidad del pokemon

        let Weaknesses = []; //Creo un array para guardar las debilidades del pokemon
        for (let typeInfo of dataJ.types) { //Recorro los tipos del pokemon
            const typeResponse = await fetch(typeInfo.type.url); //Hago una peticion HTTP para obtener la informacion del tipo del pokemon
            const typeData = await typeResponse.json(); //Convierte la respuesta a JSON para lectura
            const doubleDamageFrom = typeData.damage_relations.double_damage_from; //Guardo las debilidades del tipo del pokemon
            for (let weakness of doubleDamageFrom) {
                Weaknesses.push(weakness.name); //Guarda y muestra solo el nombre, no el objeto
            }
        }
        weaknessesP.textContent = `Weaknesses: ${[...new Set(Weaknesses)].join(", ")}`; //Muestra las debilidades del pokemon, uso Set para eliminar los duplicados 

        document.getElementById("namePokemon").textContent = `#${dataJ.id} ${dataJ.name.toUpperCase()}` //Muestro ID y nombre del pokemon

    } catch (error) {
        console.error("Error fetching Pokemon:", error); // Muestra el error en la consola si hay error
        CodeScreen.textContent="Error"; // Muestra "Error" en la pantalla verde si hay error
    }
});

//Arrows
const UpButton = document.getElementById("up");
const DownButton = document.getElementById("down");
const LeftButton = document.getElementById("left");
const RightButton = document.getElementById("right");

//ShowEvolution
async function ShareE(nameE) { //Esta peticion sirve para actualizar el sprite cada vez que cambio de evolucion, la anterior peticion solo se hace al buscar el pokemon
    try {
        const response = await fetch(`${window.ENV.API_URL}/pokemon/${nameE}`); // Hace la peticionHTTP  a la API con el nombre de la evolucion que se esta mostrando
        if (!response.ok) throw new Error("Pokemon not found"); // Si la respuesta no es ok, lanza un error ?????PARA QUE SIRVE ESTO AQUI SI NO LO USO
        const data = await response.json(); // Convierte la respuesta a JSON para lectura

        Sprites = data.sprites; //Guarda los sprites del pokemon que trae la API en el array
        currentSprite="front_default"; //Reseteo el sprite actual a front_default cada vez que cambio de evolucion

        ImagePokemon.src = Sprites[currentSprite]; // Cambia la imagen del pokemon por el sprite que se esta mostrando
        ImagePokemon.style.display = "block"; // Muestra la imagen del pokemon

        //Muestro la altura y el peso del pokemon
        document.getElementById("heightPokemon").textContent = `Height: ${data.height}`; //Muestra la altura del pokemon
        document.getElementById("weightPokemon").textContent = `Weight: ${data.weight}`; //Muestra el peso del pokemon
    }catch (error) {
        console.error("Error fetching Pokemon:", error); // Muestra el error en la consola si hay error
    }
}

UpButton.addEventListener("click", async () => { 
    if (current < evolution.length - 1) { //Se hace la comprobacion para no salirse del array
        current++; //Pasa a la sigueinte evolucion
        const nameE = evolution[current]; //Guarda el nombre de la evolucion actual
        await ShareE(nameE); //USo await ya que estoy pidiendo datos a la API y debo esperar ejecucion invento ShareE para no repetir codigo al ir a la API
    }
});

DownButton.addEventListener("click", async () => {
    if (current > 0) { //Se hace la comprobacion para no salirse del array
        current--; //Vuelve a la evolucion anterior
        const nameE = evolution[current]; //Guarda el nombre de la evolucion actual
        await ShareE(nameE); //USo await ya que estoy pidiendo datos a la API y debo esperar ejecucion invento ShareE para no repetir codigo al ir a la API
    }
});



LeftButton.addEventListener("click", () => { //Cambia entre el frontal y el trasero
    if (currentSprite === "front_default") {
        currentSprite = "back_default";
    }else if (currentSprite === "back_default") {
        currentSprite = "front_default";
    }
    ImagePokemon.src = Sprites[currentSprite]; // Cambia la imagen del pokemon por el sprite que se esta mostrando
});

RightButton.addEventListener("click", () => { //Cambia entre el normal y el shiny
    if (currentSprite === "front_shiny" || currentSprite === "back_shiny") {
        currentSprite = "front_default";
    } else {
        currentSprite = "front_shiny";
    }
    ImagePokemon.src = Sprites[currentSprite]; 
});


//Reset Button
const ResetButton = document.getElementById("reset");
ResetButton.addEventListener("click", () => {
    code = "";
    CodeScreen.textContent = "";
    ImagePokemon.style.display = "none"; // Borra el pokemon
    heightPokemon.textContent = "Height: "; // Resetea la altura
    weightPokemon.textContent = "Weight: "; // Resetea el peso
    type.textContent = "Type: "; // Resetea el tipo
    ability.textContent = "Ability: "; // Resetea la habilidad
    weaknesses.textContent = "Weaknesses: "; // Resetea las debilidades
    namePokemon.textContent = ""; //Resetea el nombre junto con el ID
});








