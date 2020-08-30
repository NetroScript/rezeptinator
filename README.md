<p align="center">
  <a href="https://nuxtjs.org/ target="blank"><img align="center" style="width:320px" alt="Nuxt Logo" src="https://nuxtjs.org/meta_400.png"/></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# Rezeptinator

This project used [this](https://github.com/Goopil/nest-nuxt-starter) as a starting reference and is made from scratch otherwise, if not noted otherwise in the code.

## Project structure

```
project
│   package.json // global packages for both server and client.
│
└───server // Nestjs
│
└───client // Nuxtjs
│
└───common // Common folders accessible for both context. Usefull to store some common classes and interfaces.
```

you can use webpack alias (defined in each tsconfig.json and shared with [tsconfig-paths-webpack-plugin](https://www.npmjs.com/package/tsconfig-paths-webpack-plugin))

* `@server`
* `@client`
* `@common`

## Getting started

### Commands

* `npm install`
* `npm run start:dev`
* `npm run build`
* `npm run start`

For further commands take a look at the `package.json`

### Settings

the server settings like PORT, HOST and HOSTNAME are injected via process.env and are located in the `nuxt.config.ts`

## Docker

A docker file is provided to setup a database with the same settings as are defined in the typeorm connection.

Alternatively you can provide your own database and edit the `ormconfig.ts`.
