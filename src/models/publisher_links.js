"use strict";

module.exports = (sequelize, DataTypes) => {
  const publisherLink = sequelize.define("publisher_links", {
    publisher_id: { type: DataTypes.INTEGER },
    sid: { type: DataTypes.INTEGER }, // source id
    cid: { type: DataTypes.INTEGER }, // client id
    custom_domain: { type: DataTypes.STRING },
    is_activated: { type: DataTypes.BOOLEAN },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  // assosiations here
  publisherLink.associate = function (models) {
    // publisherLink.belongsTo(models.publishers, {
    //   foreignKey: "publisher_id",
    // });
  };
  return publisherLink;
};
