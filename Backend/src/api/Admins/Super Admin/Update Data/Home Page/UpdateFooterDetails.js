import express from "express";

import { footerinfo } from "../../../../../models/home/footerDataModel.js";

const UpdateFooterSectionDetails = express.Router();
UpdateFooterSectionDetails.use(express.json());

UpdateFooterSectionDetails.put("/api/update/footersection", async (req, res) => {
  const currentDate = new Date();
  const isoStringCurrent = currentDate.toISOString();

  const { _id } = req.user;
  const { itemID, contackMail,Xlink, instagramLink,linkedinLink, ytLink,vsitorCount} = req.body;

  try {
    const item = await footerinfo.findById(itemID);
    if (!item) {
      res.status(404).json({ msg: "item NOT found" });
    } else {
      const UpdatedItem = await footerinfo.findByIdAndUpdate(
        item._id,
        {
          $set: {
            contackMail:contackMail,
            Xlink:Xlink,
            instagramLink:instagramLink,
            linkedinLink:linkedinLink,
            ytLink:ytLink,
            vsitorCount:vsitorCount,
            lastUpdated:isoStringCurrent
          },
        },
        { new: true }
      );

      if (!UpdatedItem) {
        res.status(400).json({ msg: "Failed To update the item" });
      } else {
        res.status(200).json({ msg: "Item Updated succesfully" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

export default UpdateFooterSectionDetails;
