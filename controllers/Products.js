import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import path from 'path';
import fs from "fs"

export const getProducts = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Product.findAll({
        attributes: ['uuid', 'name', 'videoUrl', 'audioUrl', 'author', 'description', 'transkrip', 'image', 'url'],
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      })
    } else {
      response = await Product.findAll();
      // response = await Product.findAll({
      //   attributes: ['uuid', 'name', 'videoUrl', 'audioUrl', 'author', 'description', 'transkrip', 'image', 'url'],
      //   where: {
      //     userId: req.userId
      //   },
      //   include: [{
      //     model: User,
      //     attributes: ['name', 'email']
      //   }]
      // })
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id
      }
    });

    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" })

    let response;
    if (req.role === "admin") {
      response = await Product.findOne({
        attributes: ['uuid', 'name', 'videoUrl', 'audioUrl', 'author', 'description', 'transkrip', 'image', 'url'],
        where: {
          id: product.id
        },
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      })
    } else {
      response = await Product.findOne({
        attributes: ['uuid', 'name', 'videoUrl', 'audioUrl', 'author', 'description', 'transkrip', 'image', 'url'],
        // where: {
        //   [Op.and]: [{ id: product.id }, { userId: req.userId }]
        // },
        where: {
          id: product.id
        },
        // include: [{
        //   model: User,
        //   attributes: ['name', 'email']
        // }]
      })
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
}


export const createProduct = (req, res) => {
  if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" });
  const name = req.body.title;
  const videoUrl = req.body.videoUrl;
  const audioUrl = req.body.audioUrl;
  const author = req.body.author;
  const description = req.body.description;
  const transkrip = req.body.transkrip;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`
  const allowedType = ['.png', '.jpg', '.jpeg'];

  if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "invalid image type" });

  if (fileSize > 5000000) return res.status(422).json({ msg: "Image must under 5mb" })
  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      await Product.create({
        name: name,
        videoUrl: videoUrl,
        audioUrl: audioUrl,
        author: author,
        description: description,
        transkrip: transkrip,
        image: fileName,
        url: url,
        userId: req.userId
      });
      res.status(201).json({ msg: "Content Created Successfully" })
    } catch (error) {
      console.log(error.message);
    }
  })
}


export const updateProduct = async (req, res) => {
  const product = await Product.findOne({
    where: {
      uuid: req.params.id
    }
  });
  if (!product) return res.status(404).json({ msg: "Data not Found" })

  let fileName = "";
  if (req.files === null) {
    fileName = Product.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "invalid images type" });
    if (fileSize > 5000000) return res.status(422).json({ msg: "Image must under 5mb" });

    const filepath = `./public/images/${product.image}`;
    fs.unlinkSync(filepath);

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    })
  }

  const name = req.body.title;
  const videoUrl = req.body.videoUrl;
  const audioUrl = req.body.audioUrl;
  const author = req.body.author;
  const description = req.body.description;
  const transkrip = req.body.transkrip;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`
  try {
    await Product.update(
      {
        name: name,
        videoUrl: videoUrl,
        audioUrl: audioUrl,
        author: author,
        description: description,
        transkrip: transkrip,
        image: fileName,
        url: url,
      }, {
      where: {
        id: product.id
      }
    });
    res.status(200).json({ msg: "Content Updated Successfuly" })
  } catch (error) {
    console.log(error.message)
  }
}


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id
      }
    });

    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" })
    const { name, videoUrl, audioUrl, author, description, transkrip, image, url } = req.body
    if (req.role === "admin") {
      await Product.destroy({
        where: {
          id: product.id
        },
      })
    } else {
      if (req.userId !== product.userId) return res.status(403).json({ msg: "Akses terlarang" })
      await Product.destroy({
        where: {
          [Op.and]: [{ id: product.id }, { userId: req.userId }]
        },
      })
    }
    res.status(200).json({ msg: "Product deleted Successfuly" })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }

}