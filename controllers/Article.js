import Articles from "../models/ArticleModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import path from 'path';
import fs from "fs"

export const getArticle = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Articles.findAll({
        attributes: ['uuid', 'name', 'author', 'description', 'image', 'url'],
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      })
    } else {
      response = await Articles.findAll(
        {
          attributes: ['uuid', 'name', 'author', 'description', 'image', 'url']
        }
      );
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
}

export const getArticleById = async (req, res) => {
  try {
    const article = await Articles.findOne({
      where: {
        uuid: req.params.id
      }
    });

    if (!article) return res.status(404).json({ msg: "Data tidak ditemukan" })

    let response;
    if (req.role === "admin") {
      response = await Articles.findOne({
        attributes: ['uuid', 'name', 'author', 'description', 'image', 'url'],
        where: {
          id: article.id
        },
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      })
    } else {
      response = await Articles.findOne({
        attributes: ['uuid', 'name', 'author', 'description', 'image', 'url'],
        where: {
          id: article.id
        },
      })
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
}


export const createArticle = async (req, res) => {
  if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" });
  const name = req.body.title;
  const author = req.body.author;
  const description = req.body.description;
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
      await Articles.create({
        name: name,
        author: author,
        description: description,
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

export const updateArticle = async (req, res) => {
  const article = await Articles.findOne({
    where: {
      uuid: req.params.id
    }
  });
  if (!article) return res.status(404).json({ msg: "Data not Found" })

  let fileName = "";
  if (req.files === null) {
    fileName = Articles.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "invalid images type" });
    if (fileSize > 5000000) return res.status(422).json({ msg: "Image must under 5mb" });

    const filepath = `./public/images/${article.image}`;
    fs.unlinkSync(filepath);

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    })
  }

  const name = req.body.title;
  const author = req.body.author;
  const description = req.body.description;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`
  try {
    await Articles.update(
      {
        name: name,
        author: author,
        description: description,
        image: fileName,
        url: url,
      }, {
      where: {
        id: article.id
      }
    });
    res.status(200).json({ msg: "Content Updated Successfuly" })
  } catch (error) {
    console.log(error.message)
  }
}

export const deleteArticle = async (req, res) => {
  try {
    const article = await Articles.findOne({
      where: {
        uuid: req.params.id
      }
    });

    if (!article) return res.status(404).json({ msg: "Data tidak ditemukan" })
    const { name, videoUrl, audioUrl, author, description, transkrip, image, url } = req.body
    if (req.role === "admin") {
      await Articles.destroy({
        where: {
          id: article.id
        },
      })
    } else {
      if (req.userId !== article.userId) return res.status(403).json({ msg: "Akses terlarang" })
      await Articles.destroy({
        where: {
          [Op.and]: [{ id: article.id }, { userId: req.userId }]
        },
      })
    }
    res.status(200).json({ msg: "Product deleted Successfuly" })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
}