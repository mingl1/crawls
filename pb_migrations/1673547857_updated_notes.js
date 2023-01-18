migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9a9p53mqwntsvks")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vxxsczhr",
    "name": "content",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vvas6hyb",
    "name": "title",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9a9p53mqwntsvks")

  // remove
  collection.schema.removeField("vxxsczhr")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vvas6hyb",
    "name": "note",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
