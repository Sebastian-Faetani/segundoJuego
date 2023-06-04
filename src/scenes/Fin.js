// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Fin extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("fin");
  }

  init(data) {
    // this is called before the scene is created
    // init variables
    // take data passed from other scenes
    // data object param {}
    console.log(data);
    this.cantidadEstrellas = data.cantidadEstrellas;
  }

  create() {
    let winSound = this.sound.add("winSound", { loop: false });
    winSound.play();

    this.cantidadEstrellasTexto = this.add.text(
      250,
      30,
      "Estrellas recolectadas: " + this.cantidadEstrellas,
      { fontSize: "15px", fill: "#FFFFFF" }
    );
    this.add
      .image(400, 300, "win")
      .setScale(0.555)
      .setInteractive()
      .on("pointerdown", () => {
        winSound.stop(), this.scene.start("StartMenu");
      });
  }
}
