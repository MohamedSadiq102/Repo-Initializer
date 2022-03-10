<h2 align="center"><img src="./static/pipeline-management.png" /> ConfigMe</h2>


This Azure DevOps extension automates infrastructure configurations(pipelines) on the basis of a template project.


#### Requirements

* NodeJS

#### Installation

1- Clone the repository

2- Install project dependencies

```bash
npm install
```

3- Go To `vss-extension.json` :

  - chnage the `id`

  - Change the name

  - Change the publisher

4- config the project

```bash
npm run compile
```

5- To generate the extension
```bash
tfx extension create --manifest-globs vss-extension.json
```

6- Go To your publisher and click on Add New Extension

Notice
Everytime you change the code and want to release the new update increment the version of the current Extension by 0.0.1
