<template>
  <!-- <Row> -->
  <!-- <i-col span="8"> -->
  <div>
    <div class="setting-group images-container" :style="{'padding-top': '10px'}">
      <!-- <Button @click="restoreExampleDanmaku">打开预览弹幕窗</Button> -->
      <Button @click="sendTestMessage" size="small">发送测试弹幕</Button>
      <Button @click="clearDanmaku" size="small">清空弹幕</Button>
      <!-- <Button @click="restoreExampleDanmaku">恢复默认测试弹幕</Button> -->
    </div>
    <div class="setting-group ">
      <div :class="!isBorderAdaptContent ? 'max-width': ''" class="border-image-default operatable-preview-text" :style="{...borderImageStyle, ...message_lv3}">
        <Container @drop="onDrop($event)" orientation="horizontal" :style="{'min-height': '0px'}">
          <template v-for="(setting, index) of messageSettings">
            <Draggable :key="index" v-if="setting.type==='guard' && setting.isShow" class="vertical-align-middle">
              <i class="guard-icon" :style="{'background-image': `url(${getGuardIcon('3')})`}"></i>
            </Draggable>
            <Draggable :key="index" v-if="setting.type==='medal' && setting.isShow" class="vertical-align-middle">
              <FanMedal v-if="example.ML && example.MN" :medalLevel="example.ML" :medalName="example.MN" :medalColorStart="example.MCS" :medalColorEnd="example.MCE" :medalColorBorder="example.MCB"></FanMedal>
            </Draggable>
            <Draggable :key="index" v-if="setting.type==='avatar' && setting.isShow" class="vertical-align-middle">
              <Avatar :src="example.avatar" :style="avatarSizeStyle" />
            </Draggable>
            <Draggable :key="index" v-if="setting.type==='name'" :style="{...name_lv3, ...fontStyle}" class="vertical-align-middle">
              <span>{{ `${example.uname}` }}</span>
            </Draggable>
            <Draggable :key="index" v-if="setting.type==='colon' && setting.isShow" :style="{...name_lv3, ...fontStyle}" class="vertical-align-middle">
              <span>：</span>
            </Draggable>
            <Draggable :key="index" v-if="setting.type==='comment'" class="vertical-align-middle">
              <img v-if="example.emojiUrl" :style="{  height: '20px' }" :src="example.emojiUrl" />
              <span v-else :style="{...comment_lv3, ...fontStyle}">{{ example.content }}</span>
            </Draggable>
          </template>
        </Container>
      </div>
      <!-- <span>{{ `: ${comment.comment}` }}</span> -->
      <!-- <span v-if="example.voiceUrl" @click="playAudio(example.voiceUrl)" class="voice-container">
        <Icon type="md-play" />
        <span>{{ `${example.fileDuration}"` }}</span>
      </span> -->
    </div>

    <div class="divider line one-line">
      <span class="disable-user-select" :style="{cursor: 'pointer'}" @click="changeCollapse(0)">
        常规设置
        <Icon v-if="collapse[0]" type="md-arrow-dropdown" />
        <Icon v-else type="md-arrow-dropup" />
      </span>
    </div>
    <div class="disable-user-select" v-show="collapse[0]">
      <div class="setting-group">
        <div :style="{display: 'inline-block'}">
          <span>窗体背景色</span>
          <ColorPicker transfer :value="background" @on-active-change="debouncedUpdateBackground" size="small" alpha />
        </div>
        <Divider type="vertical" />
        <div :style="{display: 'inline-block'}">
          <span :style="{'padding-right': '10px'}">整体透明度</span>
          <div class="avatar-controller-slider">
            <Slider :value="opacity" @on-change="changeOpacity"></Slider>
          </div>
        </div>
      </div>
      <div class="setting-group">
        <div :style="{display: 'inline-block'}">
          <span :style="{'padding-right': '10px'}">头像大小</span>
          <div class="avatar-controller-slider">
            <Slider :value="avatarSize" @on-change="changeAvatarSize"></Slider>
          </div>
        </div>
      </div>
      <div class="setting-group">
        <div :style="{display: 'inline-block'}">
          <span>字体</span>
          <Select :style="{ width: '100px', display: 'inline-block' }" :value="danmakuFont" @on-change="changeDanmakuFont" @on-open-change="onOpenFontSelectChange" size="small">
            <OptionGroup label="全局值">
              <Option v-for="item in fonts.filter((font) => font.type === 'default')" :value="item.value" :key="item.key">{{ item.value }}</Option>
            </OptionGroup>
            <OptionGroup label="通用字体族">
              <Option v-for="item in fonts.filter((font) => font.type === 'common')" :value="item.value" :key="item.key">{{ item.value }}</Option>
            </OptionGroup>
            <OptionGroup label="系统">
              <Option v-for="item in fonts.filter((font) => font.type === 'custom')" :value="item.value" :key="item.key">{{ item.value }}</Option>
            </OptionGroup>
          </Select>
        </div>
        <Divider type="vertical" />
        <div :style="{display: 'inline-block'}">
          <span>粗细</span>
          <Select :style="{ width: '100px', display: 'inline-block' }" :value="fontWeight" @on-change="changeFontWeight" size="small">
            <Option v-for="(option, index) in fontWeightOptions" :value="option.key" :key="index" :label="option.label">
              <span>{{ option.value }}</span>
            </Option>
          </Select>
        </div>
      </div>
      <div class="setting-group">
        <div :style="{display: 'inline-block'}">
          <span>
            <Tooltip placement="top" transfer>
              重复弹幕合并
              <div slot="content">
                <div class="description-text">
                  <p>多少毫秒内重复的弹幕将被合并</p>
                </div>
              </div>
            </Tooltip>
          </span>
          <InputNumber :value="combineSimilarTime" @on-change="changeCombineSimilarTime" :min="0" size="small" />
          {{ " ms" }}
        </div>
        <Divider type="vertical" />
        <div :style="{display: 'inline-block'}">
          <span>
            <Tooltip placement="top" transfer>
              弹幕超时消失
              <div slot="content">
                <div class="description-text">
                  <p>为 0 表示不消失，请至少设置2000以上</p>
                </div>
              </div>
            </Tooltip>
          </span>
          <InputNumber :value="hiddenExpiredTime" @on-change="changeHiddenExpiredTime" :min="0" size="small" />
          {{ " ms" }}
        </div>
      </div>
      <div class="setting-group">
        <div :style="{display: 'inline-block'}">
          <span>礼物栏展示大于</span>
          <InputNumber :value="showHeadlineThreshold" @on-change="changeShowHeadlineThreshold" :min="0" size="small" />
          {{ " 元" }}
        </div>
        <Divider type="vertical" />
        <div :style="{display: 'inline-block'}">
          <span>弹幕礼物展示大于</span>
          <InputNumber :value="showGiftCardThreshold" @on-change="changeShowGiftCardThreshold" :min="0" size="small" />
          {{ " 元" }}
        </div>
      </div>
      <div class="setting-group">
        <Button size='small' @click="openImageBorderModal">设置图片边框</Button>
      </div>
      <div class="setting-group">
        <Checkbox :value="isShowInteractInfo" @on-change="showInteractInfo">显示交互消息</Checkbox>
        <Divider type="vertical" />
        <Checkbox :value="isShowSilverGift" @on-change="showSilverGift">展示银瓜子礼物</Checkbox>
        <Divider type="vertical" />
        <Checkbox :value="isShowMemberShipIcon" @on-change="showMemberShipIcon">显示舰队图标</Checkbox>
      </div>
      <div class="setting-group">
        <Checkbox :value="isShowFanMedal" @on-change="showFanMedal">显示粉丝牌</Checkbox>
        <Divider type="vertical" />
        <Checkbox :value="isShowHeadline" @on-change="showHeadLine">显示顶部礼物栏</Checkbox>
        <Divider type="vertical" />
        <Checkbox :value="isShowColon" @on-change="showColon">显示冒号</Checkbox>
      </div>
      <div class="setting-group">
        <!-- <Checkbox :value="isUseMiniGiftCard" @on-change="useMiniGiftCard">炫彩模式</Checkbox> -->
        <Checkbox :value="isUseMiniGiftCard" @on-change="useMiniGiftCard">使用礼物小卡片</Checkbox>
      </div>
    </div>

    <div class="divider line one-line">
      <span class="disable-user-select" :style="{cursor: 'pointer'}" @click="changeCollapse(1)">
        角色：普通
        <Icon v-if="collapse[1]" type="md-arrow-dropdown" />
        <Icon v-else type="md-arrow-dropup" />
      </span>
    </div>
    <div class="disable-user-select" v-show="collapse[1]">
      <div class="setting-group">
        名称：
        <StyleEditor v-bind="editors[0]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[1]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[2]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[3]" />
      </div>
      <div class="setting-group">
        内容：
        <StyleEditor v-bind="editors[4]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[5]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[6]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[7]" />
      </div>
      <div class="setting-group">
        整体：
        <StyleEditor v-bind="editors[8]" />
        <Divider type="vertical" />
      </div>
    </div>

    <div class="divider line one-line">
      <span class="disable-user-select" :style="{cursor: 'pointer'}" @click="changeCollapse(2)">
        角色：舰长及以上
        <Icon v-if="collapse[2]" type="md-arrow-dropdown" />
        <Icon v-else type="md-arrow-dropup" />
      </span>
    </div>
    <div class="disable-user-select" v-show="collapse[2]">
      <div class="setting-group">
        名称：
        <StyleEditor v-bind="editors[9]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[10]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[11]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[12]" />
      </div>
      <div class="setting-group">
        内容：
        <StyleEditor v-bind="editors[13]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[14]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[15]" />
        <Divider type="vertical" />
        <StyleEditor v-bind="editors[16]" />
      </div>
      <div class="setting-group">
        整体：
        <StyleEditor v-bind="editors[17]" />
        <Divider type="vertical" />
      </div>
    </div>
    <!-- </i-col> -->
    <!-- <i-col span="16">
      <div class="setting-right">
        <div class="setting-right-header">
          <Button @click="sendTestMessage">发送测试弹幕</Button>
          <Button @click="restoreExampleDanmaku">恢复默认测试弹幕</Button>
          <Button @click="clearDanmaku">清空弹幕池</Button>
        </div>
        <iframe class="setting-right-content" id="preview-container" src="http://localhost:8081?example=true&port=8081" />
      </div>
    </i-col> -->
    <!-- </Row> -->
    <Modal v-model="isShowBorderModal" title="图片边框设置" width="650" scrollable lock-scroll transfer :styles="{ overflow: 'auto' }" @on-ok="applyBorderImageSetting">
      <div :style="{ padding: '20px'}">
        <span :class="!isBorderAdaptContent ? 'max-width': ''" class="border-image-default" :style="borderImageStyle">样式预览：预览图片边框效果展示文本</span>
      </div>
      <div class="images-container">
        <template v-for="(item, index) in borderImages">
          <div class="image-container" :key="index">
            <Icon class="close-icon" type="md-close-circle" @click="deleteBorderImage(index)" />
            <img :src="item.dataUrl" :class="item.isSelected ? 'image image-selected' : 'image'" @click="selectImageBorder(index)" />
          </div>
        </template>
        <label v-if="borderImages.length< 4" class="upload-file-container">
          <input :style="{display: 'none'}" type="file" accept="image/*" @change="encodeImageFileAsURL" />
          <Icon class="upload-file-icon" type="md-add" />
        </label>
      </div>
      <div :style="{ padding: '5px 10px'}">
        <Checkbox :value="isBorderAdaptContent" @on-change="changeBorderAdaptContent">适应文本长度</Checkbox>
      </div>
      <div :style="{ padding: '5px 10px'}">
        <span class="border-image-setting-text">边框宽度</span>
        <InputNumber :value="borderWidthValue" :style="{width: '55px'}" @on-change="setBorderWidthValue"></InputNumber>
      </div>
      <div :style="{ padding: '5px 10px'}">
        <span class="border-image-setting-text">
          <Tooltip placement="top" transfer>
            图片分割线
            <div slot="content" :style="{ 'white-space': 'normal' }">
              <p>border-image-slice属性会将图片分割为9个区域：四个角，四个边以及中心区域。四条切片线，从它们各自的侧面设置给定距离，控制区域的大小。</p>
              <p>https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-image-slice</p>
            </div>
          </Tooltip>
        </span>
        <Input :value="borderImageSliceValue" :style="{width: '180px'}" @on-change="setBorderImageSliceValue"></Input>
      </div>
      <div :style="{ padding: '5px 10px'}">
        <!-- https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-image-width -->
        <span class="border-image-setting-text">图片边框宽度</span>
        <Input :value="borderImageWidthValue" :style="{width: '180px'}" @on-change="setBorderImageWidthValue"></Input>
      </div>
      <div :style="{ padding: '5px 10px'}">
        <span class="border-image-setting-text">
          <Tooltip placement="top" transfer>
            填充方式
            <div slot="content" :style="{ 'white-space': 'normal' }">
              <p>border-image-repeat定义图片如何填充边框。</p>
              <p>可填值：stretch, repeat, round, space。</p>
              <p>https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-image-repeat</p>
            </div>
          </Tooltip>
        </span>
        <Input :value="borderImageRepeatValue" :style="{width: '180px'}" @on-change="setBorderImageRepeatValue"></Input>
      </div>
      <div :style="{ padding: '5px 10px'}">
        <span class="border-image-setting-text">
          <Tooltip placement="top" transfer>
            outset
            <div slot="content" :style="{ 'white-space': 'normal' }">
              <p>border-image-outset属性定义边框图像可超出边框盒的大小。</p>
              <p>https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-image-outset</p>
            </div>
          </Tooltip>
        </span>
        <Input :value="borderImageOutsetValue" :style="{width: '180px'}" @on-change="setBorderImageOutsetValue"></Input>
      </div>
    </Modal>
  </div>
</template>

<script>
import FontList from "font-list";
import SettingEditor from "./SettingEditor";
import StyleEditor from './StyleEditor'
import FanMedal from "./FanMedal";
import { Container, Draggable } from "vue-smooth-dnd";
import {
  USER_DATA_PATH,
  DEFAULT_FONTS,
  DEFAULT_COMMON_FONT_FAMILIES,
  GUARD_ICON_MAP,
  DEFAULT_AVATAR
} from "../../service/const";
import { getRandomItem } from "../../service/util";
import { cloneDeep, debounce } from 'lodash'
import { mergeSetting, updateSetting, clearMessage, sendMessages, restoreExampleMessage } from '../../service/api'
const defaultFonts = [
  ...DEFAULT_FONTS.map((font) => ({
    key: font,
    value: font,
    type: "default",
  })),
  ...DEFAULT_COMMON_FONT_FAMILIES.map((font) => ({
    key: font,
    value: font,
    type: "common",
  })),
];

export default {
  components: {
    SettingEditor,
    StyleEditor,
    FanMedal,
    Container,
    Draggable,
  },
  data() {
    return {
      USER_DATA_PATH: USER_DATA_PATH,
      fonts: defaultFonts,
      example: {
        avatar: DEFAULT_AVATAR,
        "roomId": 0,
        "sendAt": 1628534054678,
        "uid": 1,
        "uname": "测试账号",
        "isAdmin": 0,
        "role": 0,
        "content": "这是一条舰长的测试弹幕，可拖拽改变字段顺序~",
        "ML": 21,
        "MN": "测试者",
        "medalRoomId": 21452505,
        "MCB": "#5c968e",
        "MCS": "#5c968e",
        "MCE": "#5c968e",
        "_id": "020wdKl7EYV9c8cD"
      },
      isShowBorderModal: false,
      images: [],
      selectedImageBorderIndex: 0,
      collapse: [true, true, true],
      fontWeightOptions: [
        {
          key: 'lighter',
          label: 'lighter',
          value: 'lighter',
        },
        {
          key: 'normal',
          label: 'normal',
          value: 'normal',
        },
        {
          key: 'bold',
          label: 'bold',
          value: 'bold',
        },
        {
          key: 'bolder',
          label: 'bolder',
          value: 'bolder',
        },
      ],

      // editors: [
      //   // ***** normal *****
      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "名称大小",
      //     role: 0,
      //     prop: "name",
      //     styleName: "font-size",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "名称前景色",
      //     role: 0,
      //     prop: "name",
      //     styleName: "color",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "名称描边大小",
      //     role: 0,
      //     prop: "name",
      //     numberStep: 0.1,
      //     styleName: "-webkit-text-stroke-width",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "名称描边颜色",
      //     role: 0,
      //     prop: "name",
      //     styleName: "-webkit-text-stroke-color",
      //   },

      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "评论大小",
      //     role: 0,
      //     prop: "comment",
      //     styleName: "font-size",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "评论前景色",
      //     role: 0,
      //     prop: "comment",
      //     styleName: "color",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "评论描边大小",
      //     role: 0,
      //     prop: "comment",
      //     numberStep: 0.1,
      //     styleName: "-webkit-text-stroke-width",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "评论描边颜色",
      //     role: 0,
      //     prop: "comment",
      //     styleName: "-webkit-text-stroke-color",
      //   },

      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "消息背景色",
      //     role: 0,
      //     prop: "message",
      //     styleName: "background",
      //   },
      //   // ***** captain *****
      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "名称大小",
      //     role: 3,
      //     prop: "name",
      //     styleName: "font-size",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "名称前景色",
      //     role: 3,
      //     prop: "name",
      //     styleName: "color",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "名称描边大小",
      //     role: 3,
      //     prop: "name",
      //     numberStep: 0.1,
      //     styleName: "-webkit-text-stroke-width",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "名称描边颜色",
      //     role: 3,
      //     prop: "name",
      //     styleName: "-webkit-text-stroke-color",
      //   },

      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "评论大小",
      //     role: 3,
      //     prop: "comment",
      //     styleName: "font-size",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "评论前景色",
      //     role: 3,
      //     prop: "comment",
      //     styleName: "color",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "InputNumber",
      //     name: "评论描边大小",
      //     role: 3,
      //     prop: "comment",
      //     numberStep: 0.1,
      //     styleName: "-webkit-text-stroke-width",
      //   },
      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "评论描边颜色",
      //     role: 3,
      //     prop: "comment",
      //     styleName: "-webkit-text-stroke-color",
      //   },

      //   {
      //     id: Math.random(),
      //     type: "ColorPicker",
      //     name: "消息背景色",
      //     role: 3,
      //     prop: "message",
      //     styleName: "background",
      //   },
      // ],

      editors: [
        // ***** normal *****
        {
          id: Math.random(),
          type: "InputNumber",
          name: "大小",
          role: 0,
          prop: "name",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "颜色",
          role: 0,
          prop: "name",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "描边粗细",
          role: 0,
          prop: "name",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "描边颜色",
          role: 0,
          prop: "name",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "InputNumber",
          name: "大小",
          role: 0,
          prop: "comment",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "颜色",
          role: 0,
          prop: "comment",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "描边粗细",
          role: 0,
          prop: "comment",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "描边颜色",
          role: 0,
          prop: "comment",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "ColorPicker",
          name: "背景色",
          role: 0,
          prop: "message",
          styleName: "background",
        },

        // {
        //   id: Math.random(),
        //   type: "ColorPicker",
        //   name: "边框粗细",
        //   role: 0,
        //   prop: "message",
        //   styleName: "background",
        // },

        // {
        //   id: Math.random(),
        //   type: "ColorPicker",
        //   name: "边框颜色",
        //   role: 0,
        //   prop: "message",
        //   styleName: "background",
        // },

        // ***** captain *****
        {
          id: Math.random(),
          type: "InputNumber",
          name: "大小",
          role: 3,
          prop: "name",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "颜色",
          role: 3,
          prop: "name",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "描边粗细",
          role: 3,
          prop: "name",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "描边颜色",
          role: 3,
          prop: "name",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "InputNumber",
          name: "大小",
          role: 3,
          prop: "comment",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "颜色",
          role: 3,
          prop: "comment",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "描边粗细",
          role: 3,
          prop: "comment",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "描边颜色",
          role: 3,
          prop: "comment",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "ColorPicker",
          name: "背景色",
          role: 3,
          prop: "message",
          styleName: "background",
        },
      ],
    };
  },
  created() {
    this.debouncedUpdateBackground = debounce(this.updateBackground, 100)
  },
  mounted() {
    // this.initExamleMessages()

    if (defaultFonts.find((font) => font.key === this.danmakuFont)) return;
    this.fonts.push({
      key: this.danmakuFont,
      value: this.danmakuFont,
      type: "custom",
    });
  },
  computed: {
    background() {
      return this.$store.state.Config.background;
    },
    danmakuFont() {
      return this.$store.state.Config.danmakuFont;
    },
    isShowAvatar() {
      const settings = this.$store.state.Config.messageSettings
      return settings.find(setting => setting.type === 'avatar').isShow
    },
    isShowMemberShipIcon() {
      const settings = this.$store.state.Config.messageSettings
      return settings.find(setting => setting.type === 'guard').isShow
    },
    isShowInteractInfo() {
      return this.$store.state.Config.isShowInteractInfo;
    },
    isShowFanMedal() {
      const settings = this.$store.state.Config.messageSettings
      return settings.find(setting => setting.type === 'medal').isShow
    },
    avatarSize() {
      const settings = this.$store.state.Config.messageSettings
      return settings.find(setting => setting.type === 'avatar').size
    },
    combineSimilarTime() {
      return this.$store.state.Config.combineSimilarTime;
    },
    hiddenExpiredTime() {
      return this.$store.state.Config.hiddenExpiredTime;
    },
    showHeadlineThreshold() {
      return this.$store.state.Config.showHeadlineThreshold;
    },
    showGiftCardThreshold() {
      return this.$store.state.Config.showGiftCardThreshold;
    },
    isShowSilverGift() {
      return this.$store.state.Config.isShowSilverGift;
    },
    isUseMiniGiftCard() {
      return this.$store.state.Config.isUseMiniGiftCard;
    },
    isShowColon() {
      return this.$store.state.Config.isShowColon;
    },
    isShowHeadline() {
      return this.$store.state.Config.isShowHeadline;
    },
    fontWeight() {
      return this.$store.state.Config.fontWeight;
    },
    opacity() {
      return this.$store.state.Config.opacity * 100;
    },
    messageSettings() {
      return this.$store.state.Config.messageSettings
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
    avatarSizeStyle() {
      return {
        width: `${this.avatarSize}px`,
        height: `${this.avatarSize}px`,
        "line-height": `${this.avatarSize}px`,
      };
    },
    borderImages() {
      return this.$store.state.Config.borderImages;
    },
    borderImageStyle() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return {}
      return {
        'border-width': `${image['border-width']}px`,
        'border-image-width': image['border-image-width'],
        'border-image-repeat': image['border-image-repeat'],
        'border-image-slice': image['border-image-slice'],
        'border-image-outset': image['border-image-outset'],
        'border-image-source': `url(${image.dataUrl})`
      }
    },
    isBorderAdaptContent() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return false
      return image.isAdaptContent
    },
    borderImageSliceValue() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return ''
      return image['border-image-slice']
    },
    borderWidthValue() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return 0
      return image['border-width']
    },
    borderImageWidthValue() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return ''
      return image['border-image-width']
    },
    borderImageRepeatValue() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return ''
      return image['border-image-repeat']
    },
    borderImageOutsetValue() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return ''
      return image['border-image-outset']
    },
    message_lv3() {
      return this.$store.state.Config.message_lv3;
    },
    name_lv3() {
      return this.$store.state.Config.name_lv3;
    },
    comment_lv3() {
      return this.$store.state.Config.comment_lv3;
    },
    fontStyle() {
      return {
        'font-family': this.danmakuFont,
        'font-weight': this.fontWeight,
      }
    }
  },
  methods: {
    async showMemberShipIcon(status) {
      const settings = cloneDeep(this.messageSettings)
      const setting = settings.find(setting => setting.type === 'guard')
      setting.isShow = status

      const data = { messageSettings: settings }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async showFanMedal(status) {
      const settings = cloneDeep(this.messageSettings)
      const setting = settings.find(setting => setting.type === 'medal')
      setting.isShow = status

      const data = { messageSettings: settings }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async showInteractInfo(status) {
      const data = { isShowInteractInfo: status }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async sendTestMessage() {
      const randomMessage = this.randomMessageGenerator()
      await sendMessages({
        category: randomMessage.category,
        data: randomMessage
      })
    },

    async updateBackground(color) {
      const data = {
        background: color,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async changeAvatarSize(size) {
      // const data = {
      //   avatarSize: size,
      // }
      const settings = cloneDeep(this.messageSettings)
      const setting = settings.find(setting => setting.type === 'avatar')
      setting.size = size
      if (size === 0) {
        setting.isShow = false
      } else {
        setting.isShow = true
      }

      const data = { messageSettings: settings }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async changeOpacity(number) {
      const data = {
        opacity: Number((number / 100).toFixed(2)),
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
      await mergeSetting(data)
    },

    async changeCombineSimilarTime(number) {
      const data = {
        combineSimilarTime: number,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeHiddenExpiredTime(number) {
      const data = {
        hiddenExpiredTime: number,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeShowHeadlineThreshold(number) {
      const data = {
        showHeadlineThreshold: number,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async changeShowGiftCardThreshold(number) {
      const data = {
        showGiftCardThreshold: number,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async showSilverGift(status) {
      const data = {
        isShowSilverGift: status,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    randomMessageGenerator() {
      const randomNumber = Math.floor(Math.random() * 100000000);
      const randomRole = Math.floor(Math.random() * 4);
      const types = [
        {
          name: "gift",
          probability: 10,
        },
        {
          name: "comment",
          probability: 80,
        },
        {
          name: "superChat",
          probability: 10,
        },
      ];

      const randomType = getRandomItem(types).name

      if (randomType === "gift") {
        const gift = {
          _id: randomNumber,
          id: randomNumber,
          uid: randomNumber,
          uname: `bli_${randomNumber}`,
          category: 'gift',
          coinType: 1,
          type: 1,
          price: Math.floor(Math.random() * 100),
          count: 1,
          name: "随机礼物",
          role: 3,
          sendAt: Date.now(),
          batchComboId: randomNumber,
          // batchComboId: 1,
        };
        gift.role = randomRole;
        if (Math.random() * 2 < 1) {
          gift.name = "舰长";
          gift.isGuardGift = true;
          gift.price = 198;
          gift.type = 2
        }
        return gift;
      }
      if (randomType === "superChat") {
        const superChat = {
          _id: randomNumber,
          id: randomNumber,
          // id: 3333333,
          uid: randomNumber,
          category: 'superChat',
          SCId: Math.floor(Math.random() * 100000000),
          // superChatId: 3333333,
          uname: `bli_${randomNumber}`,
          type: 3,
          content: `这是一条测试SuperChat | ${new Date().toLocaleString()}`,
          price: Math.floor(Math.random() * 100),
          role: 3,
          sendAt: Date.now(),
        };
        if (Math.random() * 2 < 1) {
          superChat.commentJPN = `これはテスト用のスパチャだよ〜 | ${new Date().toLocaleString()}`;
        }
        superChat.role = randomRole;
        return superChat;
      }

      if (randomType === "comment") {
        const comment = {
          _id: randomNumber,
          id: randomNumber,
          uid: randomNumber,
          category: 'comment',
          uname: `bli_${randomNumber}`,
          type: "comment",
          content: `一条弹幕哟～`,
          role: 3,
          sendAt: Date.now(),
        };
        comment.role = randomRole;
        return comment;
      }
    },

    async restoreExampleDanmaku() {
      await restoreExampleMessage()
      // this.$store.dispatch("RESTORE_EXAMPLE_MESSAGE");
    },

    async clearDanmaku() {
      await clearMessage()
      // this.$store.dispatch("CLEAR_MESSAGE");
    },

    async getFonts() {
      const fonts = await FontList.getFonts({ disableQuoting: true });
      this.fonts = [
        ...defaultFonts,
        ...fonts.map((font) => ({ key: font, value: font, type: "custom" })),
      ];
    },

    async onOpenFontSelectChange(value) {
      if (value) {
        await this.getFonts();
      }
    },

    async changeDanmakuFont(value) {
      const data = {
        danmakuFont: value,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async useMiniGiftCard(value) {
      const data = {
        isUseMiniGiftCard: value,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    getGuardIcon(level) {
      return GUARD_ICON_MAP[level];
    },

    openImageBorderModal() {
      this.isShowBorderModal = true
    },

    encodeImageFileAsURL(e) {
      const self = this
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = function () {
        const dataUrl = reader.result
        self.$store.dispatch("UPDATE_CONFIG", {
          borderImages: [...self.borderImages, {
            isAdaptContent: false,
            dataUrl: dataUrl,
            isSelected: self.borderImages.length ? false : true,
            'border-width': 30,
            'border-image-width': '1',
            'border-image-slice': '30',
            'border-image-repeat': 'stretch',
            'border-image-outset': '0',
          }]
        })
      }
      reader.readAsDataURL(file)
    },

    selectImageBorder(index) {
      const borderImages = cloneDeep(this.borderImages)
      const preStatus = borderImages[index].isSelected
      borderImages.forEach(item => {
        item.isSelected = false
      })
      borderImages[index].isSelected = !preStatus
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    deleteBorderImage(index) {
      const borderImages = this.borderImages.filter((_, i) => {
        return i !== index
      })
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    setBorderImageSliceValue(e) {
      const borderImages = cloneDeep(this.borderImages)
      const image = borderImages.find(image => image.isSelected)
      if (!image) return
      image['border-image-slice'] = e.target.value
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    setBorderWidthValue(number) {
      const borderImages = cloneDeep(this.borderImages)
      const image = borderImages.find(image => image.isSelected)
      if (!image) return
      image['border-width'] = number
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    setBorderImageWidthValue(e) {
      const borderImages = cloneDeep(this.borderImages)
      const image = borderImages.find(image => image.isSelected)
      if (!image) return
      image['border-image-width'] = e.target.value
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    setBorderImageRepeatValue(e) {
      const borderImages = cloneDeep(this.borderImages)
      const image = borderImages.find(image => image.isSelected)
      if (!image) return
      image['border-image-repeat'] = e.target.value
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    setBorderImageOutsetValue(e) {
      const borderImages = cloneDeep(this.borderImages)
      const image = borderImages.find(image => image.isSelected)
      if (!image) return
      image['border-image-outset'] = e.target.value
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    },

    async applyBorderImageSetting() {
      const data = {
        borderImages: this.borderImages
      }
      await updateSetting(data)
    },

    showDanmakuWindow(status) {
      // const { x, y } = screen.getCursorScreenPoint();
      this.isShowDanmakuWindowLoading = true;

      if (status) {
        this.win = new BrowserWindow({
          width: this.windowWidth || 480,
          height: this.windowHeight || 540,
          // x, y,
          x: this.windowX || 0,
          y: this.windowY || 0,
          frame: false,
          transparent: true,
          hasShadow: false,
          webPreferences: {
            nodeIntegration: true,
          },
          resizable: true,
        });

        const winURL =
          process.env.NODE_ENV === "development"
            ? `http://localhost:${PORT}?port=${PORT}`
            : `http://localhost:${PORT}?port=${PORT}`;
        this.win.loadURL(winURL);
        this.win.on("close", (e) => {
          this.isShowDanmakuWindow = false;
          this.isShowDanmakuWindowLoading = false;
        });
        // 初始化时清空弹幕池
        this.$store.dispatch("CLEAR_MESSAGE");
        this.isShowDanmakuWindow = true;
        this.isShowDanmakuWindowLoading = false;
      } else {
        if (!this.win) return;
        this.win.close();
        this.win = null;
      }
    },

    changeCollapse(index) {
      const collapse = [...this.collapse]
      collapse[index] = !collapse[index]
      this.collapse = collapse
    },

    async onDrop(dropResult) {
      const { addedIndex, removedIndex, payload } = dropResult
      if (removedIndex === null && addedIndex === null) return

      const messageSettings = cloneDeep(this.messageSettings)
      const hiddenItems = messageSettings.map((setting, index) => {
        if (!setting.isShow) {
          return {
            index,
            data: setting
          }
        }
      }).filter(Boolean)
      const displayItems = messageSettings.filter(setting => setting.isShow)

      let itemToAdd
      if (removedIndex !== null) {
        itemToAdd = displayItems.splice(removedIndex, 1)[0]
      }
      if (addedIndex !== null) {
        displayItems.splice(addedIndex, 0, itemToAdd)
      }

      hiddenItems.forEach(item => {
        displayItems.splice(item.index, 0, item.data)
      })
      const data = {
        messageSettings: displayItems,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeFontWeight(value) {
      const data = {
        fontWeight: value,
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async showHeadLine(value) {
      const data = {
        isShowHeadline: value
      }
      await mergeSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async showColon(status) {
      const settings = cloneDeep(this.messageSettings)
      const setting = settings.find(setting => setting.type === 'colon')
      setting.isShow = status

      const data = { messageSettings: settings }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeBorderAdaptContent(status) {
      const borderImages = cloneDeep(this.borderImages)
      const image = borderImages.find(image => image.isSelected)
      if (!image) return
      image.isAdaptContent = status
      this.$store.dispatch("UPDATE_CONFIG", {
        borderImages: borderImages
      })
    }
  },
};
</script>

<style scoped lang="scss">
.setting-key {
  padding-top: 5px;
}
.setting-key-text {
  display: inline-block;
  width: 120px;
}
.avatar-controller-slider {
  height: 30px;
  display: inline-block;
  vertical-align: bottom;
  width: 100px;
}

.setting-right-header {
  margin: 10px;
}

.setting-right-content {
  width: 95%;
  margin: 10px;
  height: 500px;

  border-radius: 12px;
  border: solid 1px gray;
  position: relative;
}
.setting-checkbox {
  vertical-align: top;
}
.guard-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
}
// .divider {
//   display: flex;
// }

.divider {
  display: flex;

  &:before,
  &:after {
    content: "";
    flex: 1;
  }
}

.line {
  align-items: center;

  &:before,
  &:after {
    height: 1px;
    margin: 0 1em;
  }
}

.one-line {
  &:before,
  &:after {
    background: silver;
  }
}

.upload-file-container {
  border: 1px dashed silver;
  display: inline-block;
  cursor: pointer;
  width: 80px;
  height: 80px;
  position: relative;
}

.upload-file-icon {
  font-size: 24px;
  text-align: center;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
}

.images-container {
  -webkit-user-select: none;
  user-select: none;
}

.disable-user-select {
  -webkit-user-select: none;
  user-select: none;
}

.vertical-align-middle {
  vertical-align: middle !important;
}

.image-container {
  display: inline-block;
  position: relative;
  padding: 5px;
}

.image {
  width: 80px;
  height: 80px;
  border: 2px solid silver;
  cursor: pointer;
}

.image-selected {
  border: 2px solid orange;
}

.close-icon {
  color: crimson;
  position: absolute;
  font-size: 16px;
  top: 0;
  right: 0;
}

.border-image-default {
  border-style: solid;
  border-color: transparent;
  display: inline-block;
}

.border-image-setting-text {
  display: inline-block;
  width: 90px;
}

.setting-group {
  padding: 3px 20px;
}

.operatable-preview-text {
  display: inline-block;
  -webkit-user-select: none;
  user-select: none;

  & .smooth-dnd-draggable-wrapper {
    cursor: move;
  }
}

.description-text {
  white-space: normal;
}

.max-width {
  // display: inline-block;
  width: 100%;
}
</style>
