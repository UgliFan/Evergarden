const createUser = () => {
    return "CREATE TABLE `user` (`uid` varchar(255) NOT NULL COMMENT '主键uuid',`uname` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '名字',`password` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '密码',`avatar` varchar(255) CHARACTER SET utf8 NULL COMMENT '头像',`sex` int(11) NOT NULL COMMENT '性别',`tag` varchar(255) CHARACTER SET utf8 NULL COMMENT '标签',`alias` varchar(255) CHARACTER SET utf8 NULL COMMENT '昵称',`sign` varchar(255) CHARACTER SET utf8 NULL COMMENT '签名',`bigavatar` varchar(255) CHARACTER SET utf8 NULL COMMENT '大头像',`createtime` datetime NOT NULL COMMENT '注册时间',`birthday` datetime NOT NULL COMMENT '生日',PRIMARY KEY (`uid`));";
};

const createBill = (tableName) => {
    return "CREATE TABLE `" + tableName + "` (`bid` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '主键uuid',`sum` int(11) NOT NULL COMMENT '金额',`address` varchar(255) CHARACTER SET utf8 NULL COMMENT '地址',`position` varchar(255) CHARACTER SET utf8 NULL COMMENT '坐标',`type` int(11) NOT NULL COMMENT '消费类型',`create_time` datetime NOT NULL COMMENT '创建时间',`update_time` datetime NOT NULL COMMENT '更新时间',`remark` varchar(255) CHARACTER SET utf8 NULL COMMENT '备注',`pay_type` int(11) NULL COMMENT '支付类型',`pay_time` datetime NOT NULL COMMENT '消费时间',`author` varchar(255) NOT NULL COMMENT '记录人uid',PRIMARY KEY (`bid`));";
};

const createCategory = () => {
    return "CREATE TABLE `categories` (`id` varchar(50) NOT NULL,`icon` varchar(50) NULL,`name` varchar(50) NULL,`remark` varchar(255) NULL,`type` int(11) NULL,PRIMARY KEY (`id`)) DEFAULT CHARACTER SET = utf8;";
};
module.exports = {
    BILL: createBill,
    USER: createUser,
    CATEGORIES: createCategory
};