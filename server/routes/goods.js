const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const GoodsModel = require('../models/goods');
const CategoryModel = require('../models/category');
const CategorySubModel = require('../models/categorySub');

const router = new Router();

/**
 * 批量插入所有的商品数据到数据库
 * http://localhost:3000/goods/insertAllGoodsInfo
 */
router.get('/insertAllGoodsInfo', async (ctx) => {
  fs.readFile(path.resolve(__dirname, '../resource/goods.json'), 'utf8', (error, data) => {
    if (error) return;

    // parse() 用于将一个字符串解析成一个 json 对象
    data = JSON.parse(data);
    let saveCount = 0; // 记录插入数据库条数
    data.map(async (item) => {
      let goods = new GoodsModel(item); // 创建 Entity
      try {
        let value = await goods.save();
        saveCount++;
        console.log(`成功插入：${ value.NAME }, 已插入${ saveCount }条.`);
      } catch (error) {
        console.log('插入失败...');
      }
    });
  });
  ctx.body = '插入数据接口...';
});

/**
 * 插入所有的分类数据
 * http://localhost:3000/goods/insertAllCategory
 */
router.get('/insertAllCategory', async (ctx) => {
  fs.readFile(path.resolve(__dirname, '../resource/category.json'), 'utf8', (error, data) => {
    if (error) return;

    data = JSON.parse(data);
    let saveCount = 0; // 记录插入数据库条数
    data.RECORDS.map(async (item) => {
      let category = new CategoryModel(item); // 创建 Entity
      try {
        let value = await category.save();
        saveCount++;
        console.log(`成功插入：${ value.MALL_CATEGORY_NAME }, 已插入${ saveCount }条.`);
      } catch (error) {
        console.log('插入失败...');
      }
    });
  })
  ctx.body = '插入数据接口...';
});

/**
 * 插入所有的分类的子类的数据
 * http://localhost:3000/goods/insertAllCategorySub
 */
router.get('/insertAllCategorySub', async (ctx) => {
  fs.readFile(path.resolve(__dirname, '../resource/category_sub.json'), 'utf8', (error, data) => {
    if (error) return;

    data = JSON.parse(data);
    let saveCount = 0; // 记录插入数据库条数
    data.RECORDS.map(async (item) => {
      let categorySub = new CategorySubModel(item); // 创建 Entity
      try {
        let value = await categorySub.save();
        saveCount++;
        console.log(`成功插入：${ value.MALL_SUB_NAME }, 已插入${ saveCount }条.`);
      } catch (error) {
        console.log('插入失败...');
      }
    });
  })
  ctx.body = '插入数据接口...';
});

/**
 * 获取商品详细信息的接口
 */
router.get('/goodsDetailInfo', async (ctx) => {
  const goodsId = ctx.request.query.goodsId;

  try {
    let goods = await GoodsModel.findOne({ ID: goodsId });
    (goods)
      ? ctx.body = { code: 200, message: 'success', result: goods }
      : ctx.body = { code: 404, message: '无商品信息' };
  } catch(error) {
    ctx.body = { code: 500, message: error }
  }
});

/**
 * 获取商品分类 大类信息的接口
 */
router.get('/getCategoryList', async (ctx) => {
  try {
    let categoryList = await CategoryModel.find({});
    if (categoryList.length > 0) {
      ctx.body = { code: 200, result: categoryList };
    } else {
      ctx.body = { code: 404, message: '未获取到商品大分类' };
    }
  } catch (error) {
    ctx.body = { code: 500, message: error };
  }
});

/**
 * 获取商品子类 分类信息的接口
 */
router.post('/getCategorySubList', async (ctx) => {
  let categoryId = ctx.request.body.categoryId;
  
  try {
    let categorySubList = await CategorySubModel.find({ MALL_CATEGORY_ID: categoryId });
    (categorySubList.length > 0)
      ? ctx.body = { code: 200, result: categorySubList }
      : ctx.body = { code: 404, message: '未获取到商品子分类' };
  } catch (error) {
    ctx.body = { code: 500, message: error };
  }
});

/**
 * 根据商品类别 获取商品信息的接口
 */
router.post('/getGoodsList', async (ctx) => {
  let categorySubId = ctx.request.body.categorySubId;
  let page = ctx.request.body.page; // 页数
  let num = 10; // 每页 10 条数数
  let skip = (page - 1) * num; // 跳过条数

  try {
    let goodsList = await GoodsModel.find({ SUB_ID:categorySubId }).skip(skip).limit(num);
    (goodsList.length > 0)
      ? ctx.body = { code: 200, result: goodsList }
      : ctx.body = { code: 404, message: '未获取到商品数据' };
  } catch (error) {
    ctx.body = { code: 500, message: error };
  }
});

module.exports = router;