const createUser = () => {
    return "CREATE TABLE `user` (`uid` varchar(255) NOT NULL COMMENT '主键uuid',`uname` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '名字',`password` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '密码',`avatar` varchar(255) CHARACTER SET utf8 NULL COMMENT '头像',`sex` int(11) NOT NULL COMMENT '性别',`tag` varchar(255) CHARACTER SET utf8 NULL COMMENT '标签',`alias` varchar(255) CHARACTER SET utf8 NULL COMMENT '昵称',`sign` varchar(255) CHARACTER SET utf8 NULL COMMENT '签名',`bigavatar` varchar(255) CHARACTER SET utf8 NULL COMMENT '大头像',`createtime` datetime NOT NULL COMMENT '注册时间',`birthday` datetime NOT NULL COMMENT '生日',PRIMARY KEY (`uid`));";
};
const createCategory = () => {
    return "CREATE TABLE `categories` (`id` varchar(50) NOT NULL,`icon` varchar(50) NULL,`name` varchar(50) NULL,`remark` varchar(255) NULL,`type` int(11) NULL,PRIMARY KEY (`id`)) DEFAULT CHARACTER SET = utf8;";
};
const createTally = (tableName) => {
    return "CREATE TABLE `" + tableName + "` (`id` varchar(50) NOT NULL,`open_id` varchar(50) NOT NULL,`date` datetime NOT NULL,`latitude` varchar(50) NULL,`longitude` varchar(50) NULL,`remark` varchar(200) NULL,`cid` varchar(50) NOT NULL,`summary` bigint NOT NULL,`type_backup` int(11) NULL,`create_at` datetime NOT NULL,`date_format` varchar(50) NOT NULL,PRIMARY KEY (`id`))DEFAULT CHARACTER SET = utf8;";
};
const createKV = () => {
    return "CREATE TABLE `global_kv` (`id` varchar(50) NOT NULL,`global_key` varchar(50) NOT NULL,`global_value` varchar(255) NOT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8 COLLATE=utf8_general_ci COMMENT='基础key_value表'";
};
const createArtile = () => {
    return "CREATE TABLE `article_to_read` (`id` varchar(50) NOT NULL,`link` varchar(200) NOT NULL,`title` varchar(100) NOT NULL,`evaluate` varchar(200) NOT NULL,`source` varchar(50) NOT NULL,`tags` varchar(100) NULL,`create_at` datetime NOT NULL,`hot` int(11) NOT NULL DEFAULT 0,`is_read` boolean NOT NULL,`cover` varchar(100) NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8 COLLATE=utf8_general_ci COMMENT='用爬虫爬去一些感兴趣的热门文章'";
};
module.exports = {
    TALLY: createTally,
    USER: createUser,
    CATEGORIES: createCategory,
    GLOBAL_KV: createKV,
    SPIDER_ARTICLE: createArtile
};