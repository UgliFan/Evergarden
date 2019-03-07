```
DROP TABLE `user`;
DROP TABLE `bill`;

CREATE TABLE `user` (
`uid` varchar(255) NOT NULL COMMENT '主键uuid',
`uname` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '名字',
`password` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '密码',
`avatar` varchar(255) CHARACTER SET utf8 NULL COMMENT '头像',
`sex` int(11) NOT NULL COMMENT '性别',
`tag` varchar(255) CHARACTER SET utf8 NULL COMMENT '标签',
`alias` varchar(255) CHARACTER SET utf8 NULL COMMENT '昵称',
`sign` varchar(255) CHARACTER SET utf8 NULL COMMENT '签名',
`bigavatar` varchar(255) CHARACTER SET utf8 NULL COMMENT '大头像',
`createtime` datetime NOT NULL COMMENT '注册时间',
`birthday` datetime NOT NULL COMMENT '生日',
PRIMARY KEY (`uid`) 
);
CREATE TABLE `bill` (
`bid` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '主键uuid',
`sum` int(11) NOT NULL COMMENT '金额',
`address` varchar(255) CHARACTER SET utf8 NULL COMMENT '地址',
`position` varchar(255) CHARACTER SET utf8 NULL COMMENT '坐标',
`type` int(11) NOT NULL COMMENT '消费类型',
`create_time` datetime NOT NULL COMMENT '创建时间',
`update_time` datetime NOT NULL COMMENT '更新时间',
`remark` varchar(255) CHARACTER SET utf8 NULL COMMENT '备注',
`pay_type` int(11) NULL COMMENT '支付类型',
`pay_time` datetime NOT NULL COMMENT '消费时间',
`author` varchar(255) NOT NULL COMMENT '记录人uid',
PRIMARY KEY (`bid`) 
);
insert into user (uid,uname,password,avatar,sex,tag,alias,sign,bigavatar,createtime,birthday) values ('26c76003111e483d8f6809a5ae37562f','uglifan','E10ADC3949BA59ABBE56E057F20F883E','http://i0.hdslb.com/bfs/bangumi/2bf35f80c7e7a8a0a00b14b4460a33344bfce03f.jpg',1,'老公','泛特兮','什么都没写~','http://i0.hdslb.com/bfs/bangumi/b6e3986355efc081b7f4aaf9f576c9ce8116e193.jpg','2018-10-22 17:03:44','1991-06-06 12:00:00');

DROP TABLE `categories`;
CREATE TABLE `categories` (
`id` varchar(50) NOT NULL,
`icon` varchar(50) NULL,
`name` varchar(50) NULL,
`remark` varchar(255) NULL,
`type` int(11) NULL,
PRIMARY KEY (`id`) 
)
DEFAULT CHARACTER SET = utf8;

DROP TABLE `tally_2019_02`;

CREATE TABLE `tally_2019_02` (
`id` varchar(50) NOT NULL,
`open_id` varchar(50) NOT NULL,
`date` datetime NOT NULL,
`latitude` varchar(50) NULL,
`longitude` varchar(50) NULL,
`remark` varchar(200) NULL,
`cid` varchar(50) NOT NULL,
`summary` bigint NOT NULL,
`type_backup` int(11) NULL,
`create_at` datetime NOT NULL,
`date_format` varchar(50) NOT NULL,
PRIMARY KEY (`id`) 
)
DEFAULT CHARACTER SET = utf8;

```