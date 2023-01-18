migrate((db) => {
  const collection = new Collection({
    "id": "9a9p53mqwntsvks",
    "created": "2023-01-12 18:20:17.093Z",
    "updated": "2023-01-12 18:20:17.093Z",
    "name": "notes",
    "type": "base",
    "system": false,
    "schema": [
      {
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
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("9a9p53mqwntsvks");

  return dao.deleteCollection(collection);
})
