// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Juego extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("nivel2");
  }

  init(data) {
    // this is called before the scene is created
    // init variables
    // take data passed from other scenes
    // data object param {}

    console.log(data);
    this.nivel = 2;
    this.cantidadEstrellas = data.cantidadEstrellas || 0;
    this.gameOver = false;
  }

  create() {
    // todo / para hacer: texto de puntaje
    const map = this.make.tilemap({ key: "map2" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const capaFondo = map.addTilesetImage("sky", "tilesFondo");
    const capaPlataformas = map.addTilesetImage("platform", "tilesPlataforma");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const fondoLayer = map.createLayer("fondo", capaFondo, 0, 0);
    const plataformaLayer = map.createLayer(
      "plataformas",
      capaPlataformas,
      0,
      0
    );
    const objectosLayer = map.getObjectLayer("objetos");

    plataformaLayer.setCollisionByProperty({ colision: true });

    console.log("spawn point player", objectosLayer);

    // crear el jugador
    // Find in the Object Layer, the name "dude" and get position
    let spawnPoint = map.findObject("objetos", (obj) => obj.name === "jugador");
    console.log(spawnPoint);
    // The player and its settings
    this.jugador = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    this.jugador.setBounce(0.1);
    this.jugador.setCollideWorldBounds(true);

    spawnPoint = map.findObject("objetos", (obj) => obj.name === "salida");
    console.log("spawn point salida ", spawnPoint);
    this.salida = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "salida")
      .setScale(0.2);

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create empty group of starts
    this.estrellas = this.physics.add.group();
    this.bomb = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // find object layer
    // if type is "stars", add to stars group
    objectosLayer.objects.forEach((objData) => {
      //console.log(objData.name, objData.type, objData.x, objData.y);

      const { x = 0, y = 0, name } = objData;
      switch (name) {
        case "estrella": {
          // add star to scene
          // console.log("estrella agregada: ", x, y);

          const star = (this.estrellas.create(x, y, "star"));
          break;
        }
        case "bomb": {
          const bomb = this.bomb.create(x, y, "bomb").setBounce(1, 1);
          break;
        }
      }
    });

    this.salida.visible = false;

    this.physics.add.collider(this.jugador, plataformaLayer);
    this.physics.add.collider(this.estrellas, plataformaLayer);
    this.physics.add.collider(
      this.jugador,
      this.estrellas,
      this.recolectarEstrella,
      null,
      this
    );
    this.physics.add.collider(this.bomb, plataformaLayer)
    this.physics.add.collider(
      this.jugador,
      this.bomb,
      this.bombKill,
      null,
      this
    );
    this.physics.add.collider(this.salida, plataformaLayer);
    this.physics.add.overlap(
      this.jugador,
      this.salida,
      this.esVencedor,
      () => this.cantidadEstrellas >= 1, // condicion de ejecucion
      this
    );

    /// mostrar cantidadEstrella en pantalla
    this.cantidadEstrellasTexto = this.add.text(
      15,
      15,
      "Nivel: " +
        this.nivel +
        " / Estrellas recolectadas: " +
        this.cantidadEstrellas.toString(),
      { fontSize: "24px", fontFamily: "impact", fill: "#FFFFFF" }
    );

    //add timer
    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

    //timer appears
    this.timer = 120;
    this.timerText = this.add.text(750, 5, this.timer, {
      fontSize: "32px",
      fontFamily: "impact",
      fill: "#FFFFFF",
    });

    // add camara to follow player
    this.cameras.main.startFollow(this.jugador);

    // world bounds
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // camara dont go out of the map
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // fijar texto para que no se mueva con la camara
    this.cantidadEstrellasTexto.setScrollFactor(0);
    this.timerText.setScrollFactor(0);

    // add collider to a non phisics group
    this.physics.add.collider(this.estrellas, this.player, () => {
      console.log("colision");
    });

     //add bomb bounce
     this.bomb.setVelocity(200, 200);
    
  }

  update() {
    // update game objects
    // check input
    //move left

    if (this.gameOver) {
      console.log("you losee");
      this.scene.restart();
    }

    if (this.cursors.left.isDown) {
      this.jugador.setVelocityX(-160);
      this.jugador.anims.play("left", true);
    }
    //move right
    else if (this.cursors.right.isDown) {
      this.jugador.setVelocityX(160);
      this.jugador.anims.play("right", true);
    }
    //stop
    else {
      this.jugador.setVelocityX(0);
      this.jugador.anims.play("turn");
    }

    //jump
    if (this.cursors.up.isDown && this.jugador.body.blocked.down) {
      this.jugador.setVelocityY(-550);
    }
  }

  recolectarEstrella(jugador, estrella) {
    estrella.disableBody(true, true);

    // todo / para hacer: sumar puntaje
    //this.cantidadEstrellas = this.cantidadEstrellas + 1;
    if(this.estrellas.getTotalUsed() === 0){
      this.salida.visible = true
    }
    this.cantidadEstrellas++;

    this.cantidadEstrellasTexto.setText(
      "Nivel: " +
        this.nivel +
        " / Estrellas recolectadas: " +
        this.cantidadEstrellas.toString()
    );
  }

  onSecond() {
    this.timer--;
    this.timerText.setText(this.timer);
    if (this.timer <= 0) {
      this.gameOver = true;
    }
  }

  bombKill(jugador, bomb) {
    this.scene.restart();
  }


  esVencedor(jugador, salida) {
    // if (this.cantidadEstrellas >= 5)
    // sacamos la condicion porque esta puesta como 4to parametro en el overlap

    console.log("estrellas recolectadas", this.cantidadEstrellas);

    this.scene.start("nivel3", {
      cantidadEstrellas: this.cantidadEstrellas,
      y: "este es un dato de muestra",
      z: "este es otro atributo enviado a otro escena",
    });
  }
}
