### What I need ?
我需要一个可持久化的存储方式保存数据，提供方便的查询语句，并且保证一定的性能。

#### nedb
优点：简单，特别简单，使用方便，文档也很明白，存储结构也简单，方便debug。
缺点：缺少维护，上一次release已经是5年前，存在大量issue没有维护。 api老旧，依旧是callback风格。 数据量较大时索引缓慢。

现在项目内使用，目前存在最大的问题是启动应用需要建立索引，如果有大量数据，会卡住几秒时间。由于加载数据库会占用内存，据说最多只支持到200+m数据文件，暂时还没遇到问题，但是可能需要做文件归档逻辑。

#### rxdb
优点：mquery，熟悉mongo和mongoose很容易上手，如果需要迁移mongo，也比nedb容易。 文档清晰。 社区活跃，有人维护。
缺点：比nedb更复杂，部分特性我用不到。需要依赖其他适配数据库，导致学习成本增加，也会带来调试成本增加。 需要预先定义schema，由于本项目数据结构自由，且开发过程中变动较大，会降低开发速度。

主要还是从问题点出发，考察是否能解决nedb的大数据量支持问题。可以考虑在数据结构基本稳定之后做一次迁移。适配层使用levelDB，由于levelDB本身api不好用，还是需要rxdb包一下。