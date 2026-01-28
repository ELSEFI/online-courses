const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../services/imageUpload");
const { deleteFromCloudinary } = require("../services/cloudinaryDestroy");

async function getAllDescendantCategoryIds(categoryId) {
  const children = await Category.find({ parent: categoryId }).select("_id");

  let ids = children.map((child) => child._id);

  for (const child of children) {
    const childIds = await getAllDescendantCategoryIds(child._id);
    ids = ids.concat(childIds);
  }

  return ids;
}

exports.addCategory = async (req, res) => {
  const {
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    parentsCategory,
    order,
  } = req.body;

  let result = null;

  try {
    if (req.file) {
      result = await uploadImageToCloudinary(req.file.buffer, "Categories");
    }
    const category = await Category.create({
      name: {
        en: nameEn,
        ar: nameAr,
      },
      description: {
        en: descriptionEn,
        ar: descriptionAr,
      },
      parent: parentsCategory || null,
      order: order ?? 0,
      image: result?.public_id || null,
    });
    res
      .status(201)
      .json({ message: "Category Created Successfully", category });
  } catch (error) {
    if (result) {
      await deleteFromCloudinary(result.public_id);
    }
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category with same name already exists in this level",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getCategoryTree();
    res.status(200).json({ results: categories.length, data: categories });
  } catch (error) {
    console.error("Categories Error:", error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getAllUnActiveCategories = async (req, res) => {
  try {
    const isActive = false;
    const categories = await Category.getCategoryTree({ isActive });

    res.status(200).json({ results: categories.length, data: categories });
  } catch (error) {
    console.error("Categories Error:", error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getSubCategories = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const filter = {
      _id: categoryId,
      isActive: true,
    };
    const populateOptions = {
      path: "subcategories",
      options: { sort: { order: 1, "name.en": 1 } },
      match: { isActive: true },
    };

    const category = await Category.findOne(filter).populate(populateOptions);
    if (!category)
      return res.status(400).json({ message: "Not Founded Category" });

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.disableCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category Not Found" });

    const children = await getAllDescendantCategoryIds(categoryId);
    await Category.updateMany(
      {
        _id: { $in: [categoryId, ...children] },
      },
      { isActive: false }
    );

    res.status(200).json({
      message: "Category and all subcategories disabled successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.restoreCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category Not Found" });

    const children = await getAllDescendantCategoryIds(categoryId);
    await Category.updateMany(
      {
        _id: { $in: [categoryId, ...children] },
      },
      { isActive: true }
    );

    res.status(200).json({
      message: "Category and all subcategories restored successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const {
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    parentCategory,
    order,
  } = req.body;

  let result = null;

  try {
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({
        message: "Category Not Found",
      });
    let imageId = category.image;
    if (req.file) {
      if (category.image) {
        await deleteFromCloudinary(category.image);
      }
      result = await uploadImageToCloudinary(
        req.file.buffer,
        "Categories"
      );
      imageId = result.public_id;
    }
    await Category.findByIdAndUpdate(
      categoryId,
      {
        name: {
          en: nameEn ?? category.name.en,
          ar: nameAr ?? category.name.ar,
        },
        description: {
          en: descriptionEn ?? category.description.en,
          ar: descriptionAr ?? category.description.ar,
        },
        parent: parentCategory ?? category.parent,
        order: order ?? category.order,
        image: imageId,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Category Updated Successfully" });
  } catch (error) {
    if (result) {
      await deleteFromCloudinary(result.public_id);
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
