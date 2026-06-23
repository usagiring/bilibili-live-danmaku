<template>
  <div class="page">
    <!-- ═══ Cookie ═══ -->
    <div class="divider">Cookie 设置</div>
    <div class="section">
      <div class="section-row">
        <input
          class="input"
          v-model="cookieInput"
          type="password"
          placeholder="输入 B站 Cookie..."
          style="width: 280px; text-align: left; padding: 0 8px" />
        <button
          class="btn btn-default"
          style="font-size: 10px; height: 22px"
          @click="showQrCodeLoginModal">
          扫码登录
        </button>
        <span
          class="tip-icon"
          @click="showCookieTip">
          <Icon
            type="md-information-circle"
            size="20"
            color="#2d8cf0" />
        </span>
      </div>
    </div>

    <!-- ═══ dmStyle — 弹幕窗样式 ═══ -->
    <div class="divider">弹幕窗样式</div>
    <div
      class="section"
      style="padding-bottom: 8px">
      <div
        class="section-row"
        style="gap: 4px">
        <button
          class="btn btn-default"
          style="font-size: 10px; height: 22px"
          @click="sendTestDanmaku">
          生成测试弹幕
        </button>
        <button
          class="btn btn-default"
          style="font-size: 10px; height: 22px"
          @click="clearDM">
          清空弹幕
        </button>
        <button
          class="btn btn-default"
          style="font-size: 10px; height: 22px"
          @click="restoreDmDefaults">
          恢复默认
        </button>
      </div>
    </div>

    <div class="section">
      <!-- 弹幕排版 -->
      <div class="slot-box">
        <span class="slot-box-label">弹幕排版</span>
        <draggable
          :list="slotItems"
          item-key="type"
          class="chips slot-chips"
          :animation="200"
          ghost-class="slot-ghost"
          @change="onSlotDragEnd">
          <template #item="{ element: s }">
            <span
              class="chip"
              :class="{ on: s.isShow }"
              @click="toggleSlot(s.type)">
              {{ slotNameMap[s.type] }}
            </span>
          </template>
        </draggable>
      </div>

      <!-- 其他开关 -->
      <div class="chips">
        <!-- <span style="color: #ddd; margin: 0 2px">│</span> -->
        <!-- <span class="chip" :class="{ on: dmStyle?.isShowSuperChatJPN !== false }"
          @click="toggle('dmStyle.isShowSuperChatJPN')">SC日文</span> -->
        <!-- <span class="chip" :class="{ on: dmStyle?.isShowAnchorIcon !== false }"
          @click="toggle('dmStyle.isShowAnchorIcon')"
          >舰队标记</span
        > -->
        <!-- <span class="chip" :class="{ on: dmStyle?.isShowAdminIcon === true }"
          @click="toggle('dmStyle.isShowAdminIcon')">房管标</span> -->
        <span
          class="chip"
          :class="{ on: dmStyle?.isShowInteractInfo === true }"
          @click="toggle('dmStyle.isShowInteractInfo')"
          >入场消息</span
        >
        <span
          class="chip"
          :class="{ on: dmStyle?.isShowType1 === true }"
          @click="toggle('dmStyle.isShowType1')"
          >节奏风暴</span
        >
        <span
          class="chip"
          :class="{ on: dmStyle?.isShowType2 === true }"
          @click="toggle('dmStyle.isShowType2')"
          >天选时刻</span
        >
        <span
          class="chip"
          :class="{ on: dmStyle?.isShowSilverGift === true }"
          @click="toggle('dmStyle.isShowSilverGift')"
          >银瓜子礼物</span
        >
        <span
          class="chip"
          :class="{ on: dmStyle?.isShowHeadline !== false }"
          @click="toggle('dmStyle.isShowHeadline')"
          >礼物栏</span
        >
        <span style="color: #ddd; margin: 0 2px">│</span>
        <span
          class="chip"
          :class="{ on: dmStyle?.isWindowAlwaysOnTop === true }"
          @click="toggle('dmStyle.isWindowAlwaysOnTop')"
          >窗口置顶</span
        >
        <span
          class="chip"
          :class="{ on: dmRawStyle?.ignoreMouseEvent === true }"
          @click="toggle('dmRawStyle.ignoreMouseEvent')"
          >鼠标穿透</span
        >
      </div>

      <div class="section-row">
        <span class="label">透明度</span>
        <span class="stepper">
          <span
            class="stepper-btn"
            @click="stepDown('dmStyle.windowOpacity', 1, 0, 0.05)"
            >−</span
          >
          <input
            class="stepper-input"
            :value="Math.round((dmStyle?.windowOpacity ?? 1) * 100)"
            @change="setVal('dmStyle.windowOpacity', Number(($event.target as HTMLInputElement).value) / 100)" />
          <span
            class="stepper-btn"
            @click="stepUp('dmStyle.windowOpacity', 1, 1, 0.05)"
            >+</span
          >
        </span>
        <span
          class="label"
          style="margin-left: 8px"
          >背景色</span
        >
        <label class="color-pick">
          <span
            class="color-dot"
            :style="{ background: dmStyle?.windowBackground || '#1e1e28' }"></span>
          <input
            type="color"
            :value="dmStyle?.windowBackground || '#1e1e28'"
            @change="setVal('dmStyle.windowBackground', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>
      <div class="section-row">
        <span class="label">字体</span>
        <select
          class="select"
          style="width: 90px"
          :value="dmStyle?.font || 'auto'"
          @change="setVal('dmStyle.font', ($event.target as HTMLSelectElement).value)">
          <option value="auto">auto</option>
          <option value="serif">serif</option>
          <option value="sans-serif">sans-serif</option>
          <option value="monospace">monospace</option>
        </select>
        <span
          class="label"
          style="margin-left: 8px"
          >字重</span
        >
        <span class="segmented">
          <span
            class="seg-item"
            :class="{ on: dmStyle?.fontWeight === 'lighter' }"
            @click="setVal('dmStyle.fontWeight', 'lighter')">
            细体
          </span>
          <span
            class="seg-item"
            :class="{ on: dmStyle?.fontWeight === 'normal' }"
            @click="setVal('dmStyle.fontWeight', 'normal')">
            正常
          </span>
          <span
            class="seg-item"
            :class="{ on: dmStyle?.fontWeight === 'bold' }"
            @click="setVal('dmStyle.fontWeight', 'bold')">
            加粗
          </span>
        </span>
      </div>
      <div class="section-row">
        <span class="label">头像大小</span>
        <span class="stepper">
          <span
            class="stepper-btn"
            @click="stepDown('dmStyle.faceSize', 28, 12, 2)"
            >−</span
          >
          <input
            class="stepper-input"
            :value="dmStyle?.faceSize ?? 28"
            @change="setVal('dmStyle.faceSize', Number(($event.target as HTMLInputElement).value))" />
          <span
            class="stepper-btn"
            @click="stepUp('dmStyle.faceSize', 28, 64, 2)"
            >+</span
          >
        </span>
      </div>
      <div class="section-row">
        <span class="label">重复合并</span>
        <input
          class="input"
          style="width: 48px"
          :value="dmStyle?.combineSimilarTime ?? 3000"
          @change="setVal('dmStyle.combineSimilarTime', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">ms</span>
      </div>
      <div class="section-row">
        <span class="label">弹幕超时消隐</span>
        <input
          class="input"
          style="width: 48px"
          :value="dmStyle?.hiddenExpiredTime ?? 0"
          @change="setVal('dmStyle.hiddenExpiredTime', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">ms</span>
      </div>
      <!-- <div class="section-row">
        <span class="label">输出通道数</span>
        <input class="input" style="width:32px" :value="dmStyle?.channelCount ?? 1"
          @change="setVal('dmStyle.channelCount', Number(($event.target as HTMLInputElement).value))" />
      </div> -->
      <div class="section-row">
        <span class="label">弹幕礼物阈值</span>
        <input
          class="input"
          style="width: 40px"
          :value="dmStyle?.showGiftCardThreshold ?? 0"
          @change="setVal('dmStyle.showGiftCardThreshold', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">元</span>
      </div>
      <div class="section-row">
        <span class="label">礼物栏阈值</span>
        <input
          class="input"
          style="width: 40px"
          :value="dmStyle?.showHeadlineThreshold ?? 0"
          @change="setVal('dmStyle.showHeadlineThreshold', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">元</span>
      </div>

      <!-- 等级样式 -->
      <div class="slot-box slot-box--tabs">
        <div class="lvl-tabs">
          <span
            class="lvl-tab"
            :class="{ on: activeLevel === '0' }"
            @click="activeLevel = '0'"
            >普通</span
          >
          <span
            class="lvl-tab"
            :class="{ on: activeLevel === '1' }"
            @click="activeLevel = '1'"
            >舰长</span
          >
          <span
            class="lvl-tab"
            :class="{ on: activeLevel === '2' }"
            @click="activeLevel = '2'"
            >提督</span
          >
          <span
            class="lvl-tab"
            :class="{ on: activeLevel === '3' }"
            @click="activeLevel = '3'"
            >总督</span
          >
          <span
            class="lvl-tab"
            :class="{ on: activeLevel === '99' }"
            @click="activeLevel = '99'"
            >房管</span
          >
          <span
            class="lvl-tab"
            :class="{ on: activeLevel === 'Interact' }"
            @click="activeLevel = 'Interact'"
            >入场</span
          >
        </div>
        <div class="section-row">
          <span
            class="label"
            style="min-width: auto">
            背景色
          </span>
          <label class="color-pick">
            <span
              class="color-dot"
              :style="{ background: currentLevelStyle?.bgColor || '#000' }"></span>
            <input
              type="color"
              :value="currentLevelStyle?.bgColor || '#000000'"
              @change="setLevelStyleColor('bg', ($event.target as HTMLInputElement).value)" />
          </label>
          <span class="hint">边框宽</span>
          <input
            class="input"
            style="width: 28px"
            :value="currentLevelStyle?.borderWidth ?? 0"
            @change="setLevelStyle('borderWidth', ($event.target as HTMLInputElement).value)" />
          <span class="hint">边框色</span>
          <label class="color-pick">
            <span
              class="color-dot"
              :style="{ background: currentLevelStyle?.borderColor || 'transparent' }"></span>
            <input
              type="color"
              :value="currentLevelStyle?.borderColor || '#000000'"
              @change="setLevelStyleColor('border', ($event.target as HTMLInputElement).value)" />
          </label>
          <span class="hint">圆角</span>
          <input
            class="input"
            style="width: 32px"
            :value="currentLevelStyle?.borderRadius ?? 0"
            @change="setLevelStyle('borderRadius', ($event.target as HTMLInputElement).value)" />
          <div
            v-if="activeLevel === '99'"
            class="icon-dropdown">
            <div
              class="icon-trigger"
              @click="iconOpen = !iconOpen">
              <span
                v-if="!dmStyle?.adminIcon"
                style="font-size: 10px; color: #999">
                无
              </span>
              <Icon
                v-else
                :type="dmStyle?.adminIcon"
                :color="dmStyle?.adminIconColor || '#ff9900'"
                size="16" />
            </div>
            <div
              class="icon-overlay"
              v-show="iconOpen"
              @click="iconOpen = false"></div>
            <div
              class="icon-menu"
              v-show="iconOpen">
              <div
                class="icon-item"
                :class="{ on: !dmStyle?.adminIcon }"
                @click="selectNoIcon">
                <span style="font-size: 10px; color: #999">无</span>
              </div>
              <div
                v-for="icon in adminIcons"
                :key="icon"
                class="icon-item"
                :class="{ on: dmStyle?.adminIcon === icon }"
                @click="selectAdminIcon(icon)">
                <Icon
                  :type="icon"
                  :color="dmStyle?.adminIconColor || '#ff9900'"
                  size="18" />
              </div>
            </div>
          </div>
          <label
            v-if="activeLevel === '99'"
            class="color-pick">
            <span
              class="color-dot"
              :style="{ background: dmStyle?.adminIconColor || '#ff9900' }"></span>
            <input
              type="color"
              :value="dmStyle?.adminIconColor || '#ff9900'"
              @change="setVal('dmStyle.adminIconColor', ($event.target as HTMLInputElement).value)" />
          </label>
        </div>
        <div class="section-row">
          <span
            class="label"
            style="min-width: auto"
            >昵称</span
          >
          <span class="hint">字号</span>
          <input
            class="input"
            style="width: 30px"
            :value="currentLevelStyle?.usernameFontSize ?? 13"
            @change="setLevelStyle('userFontSize', ($event.target as HTMLInputElement).value)" />
          <span class="hint">颜色</span>
          <label class="color-pick">
            <span
              class="color-dot"
              :style="{ background: currentLevelStyle?.usernameColor || '#66ccff' }"></span>
            <input
              type="color"
              :value="currentLevelStyle?.usernameColor || '#66ccff'"
              @change="setLevelStyleColor('user', ($event.target as HTMLInputElement).value)" />
          </label>
          <span class="hint">描边宽</span>
          <input
            class="input"
            style="width: 28px"
            :value="currentLevelStyle?.usernameStrokeWidth ?? 0"
            @change="setLevelStyle('userStrokeWidth', ($event.target as HTMLInputElement).value)" />
          <span class="hint">描边色</span>
          <label class="color-pick">
            <span
              class="color-dot"
              :style="{ background: currentLevelStyle?.usernameStrokeColor || '#000' }"></span>
            <input
              type="color"
              :value="currentLevelStyle?.usernameStrokeColor || '#000000'"
              @change="setLevelStyleColor('userStroke', ($event.target as HTMLInputElement).value)" />
          </label>
        </div>
        <div class="section-row">
          <span
            class="label"
            style="min-width: auto"
            >内容</span
          >
          <span class="hint">字号</span>
          <input
            class="input"
            style="width: 30px"
            :value="currentLevelStyle?.commentFontSize ?? 13"
            @change="setLevelStyle('commentFontSize', ($event.target as HTMLInputElement).value)" />
          <span class="hint">颜色</span>
          <label class="color-pick">
            <span
              class="color-dot"
              :style="{ background: currentLevelStyle?.commentColor || '#fff' }"></span>
            <input
              type="color"
              :value="currentLevelStyle?.commentColor || '#ffffff'"
              @change="setLevelStyleColor('comment', ($event.target as HTMLInputElement).value)" />
          </label>
          <span class="hint">描边宽</span>
          <input
            class="input"
            style="width: 28px"
            :value="currentLevelStyle?.commentStrokeWidth ?? 0"
            @change="setLevelStyle('commentStrokeWidth', ($event.target as HTMLInputElement).value)" />
          <span class="hint">描边色</span>
          <label class="color-pick">
            <span
              class="color-dot"
              :style="{ background: currentLevelStyle?.commentStrokeColor || '#000' }"></span>
            <input
              type="color"
              :value="currentLevelStyle?.commentStrokeColor || '#000000'"
              @change="setLevelStyleColor('commentStroke', ($event.target as HTMLInputElement).value)" />
          </label>
        </div>
      </div>
    </div>

    <!-- ═══ dmRawStyle — 原生弹幕窗样式 ═══ -->
    <div class="divider">原生弹幕窗样式</div>
    <div class="section">
      <div class="chips">
        <span
          class="chip"
          :class="{ on: dmRawStyle?.isWindowAlwaysOnTop === true }"
          @click="toggle('dmRawStyle.isWindowAlwaysOnTop')"
          >窗口置顶</span
        >
        <span
          class="chip"
          :class="{ on: dmRawStyle?.ignoreMouseEvent === true }"
          @click="toggle('dmRawStyle.ignoreMouseEvent')"
          >鼠标穿透</span
        >
      </div>
      <div class="section-row">
        <span class="label">透明度</span>
        <span class="stepper">
          <span
            class="stepper-btn"
            @click="stepDown('dmRawStyle.windowOpacity', 1, 0, 0.05)"
            >−</span
          >
          <input
            class="stepper-input"
            :value="Math.round((dmRawStyle?.windowOpacity ?? 1) * 100)"
            @change="setVal('dmRawStyle.windowOpacity', Number(($event.target as HTMLInputElement).value) / 100)" />
          <span
            class="stepper-btn"
            @click="stepUp('dmRawStyle.windowOpacity', 1, 1, 0.05)"
            >+</span
          >
        </span>
        <span
          class="label"
          style="margin-left: 8px"
          >背景色</span
        >
        <label class="color-pick">
          <span
            class="color-dot"
            :style="{ background: dmRawStyle?.windowBackground || '#1e1e28' }"></span>
          <input
            type="color"
            :value="dmRawStyle?.windowBackground || '#1e1e28'"
            @change="setVal('dmRawStyle.windowBackground', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>
      <div class="section-row">
        <span class="label">方向</span>
        <span class="segmented">
          <span
            class="seg-item"
            :class="{ on: (dmRawStyle?.direction || 'RL') === 'LR' }"
            @click="setVal('dmRawStyle.direction', 'LR')"
            >向左</span
          >
          <span
            class="seg-item"
            :class="{ on: (dmRawStyle?.direction || 'RL') === 'RL' }"
            @click="setVal('dmRawStyle.direction', 'RL')"
            >向右</span
          >
        </span>
      </div>
      <div class="section-row">
        <span class="label">整体字号</span>
        <input
          class="input"
          style="width: 40px"
          :value="(dmRawStyle as any)?.fontSize ?? 14"
          @change="setVal('dmRawStyle.fontSize', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">px</span>
      </div>
      <div class="section-row">
        <span class="label">表情大小</span>
        <input
          class="input"
          style="width: 40px"
          :value="dmRawStyle?.emojiSize ?? 24"
          @change="setVal('dmRawStyle.emojiSize', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">px</span>
      </div>
      <div class="section-row">
        <span class="label">弹幕持续时间</span>
        <input
          class="input"
          style="width: 40px"
          :value="dmRawStyle?.duration ?? 15"
          @change="setVal('dmRawStyle.duration', Number(($event.target as HTMLInputElement).value))" />
        <span class="input-unit">ms</span>
      </div>
    </div>

    <!-- ═══ 直播与录制 ═══ -->
    <div class="divider">直播与录制</div>
    <div class="section">
      <div class="chips">
        <span
          class="chip"
          :class="{ on: liveConfig?.isWithCookie === true }"
          @click="toggle('liveConfig.isWithCookie')"
          >携带Cookie</span
        >
      </div>
      <div class="section-row">
        <span class="label">音量</span>
        <span class="stepper">
          <span
            class="stepper-btn"
            @click="stepDown('liveConfig.volume', 60, 0, 5)"
            >−</span
          >
          <input
            class="stepper-input"
            :value="liveConfig?.volume ?? 60"
            @change="setVal('liveConfig.volume', Number(($event.target as HTMLInputElement).value))" />
          <span
            class="stepper-btn"
            @click="stepUp('liveConfig.volume', 60, 100, 5)"
            >+</span
          >
        </span>
      </div>
      <div class="section-row">
        <span class="label">保存路径</span>
        <input
          class="input"
          style="width: 230px"
          :value="recordConfig?.savePath || ''"
          disabled
          placeholder="/path/to/save" />
        <button
          class="btn btn-default"
          style="font-size: 10px"
          @click="selectSavePath">
          选择
        </button>
      </div>
      <div class="section-row">
        <span class="label">画质</span>
        <span class="segmented">
          <span
            class="seg-item"
            :class="{ on: (recordConfig?.quality || '原画') === '原画' }"
            @click="setVal('recordConfig.quality', '原画')"
            >原画</span
          >
          <span
            class="seg-item"
            :class="{ on: recordConfig?.quality === '高清' }"
            @click="setVal('recordConfig.quality', '高清')"
            >高清</span
          >
        </span>
      </div>
    </div>

    <!-- ═══ chartConfig — 图表 ═══ -->
    <!-- <div class="divider">图表</div>
    <div class="section">
      <div class="section-row">
        <span class="label">色彩表</span>
        <div style="display: flex; gap: 4px; flex-wrap: wrap">
          <span
            class="tag"
            v-for="(c, i) in chartConfig?.colors || []"
            :key="i">
            <span
              class="tag-dot"
              :style="{ background: c }"></span
            >{{ c }}
            <span
              class="tag-close"
              @click="removeColor(i)"
              >✕</span
            >
          </span>
          <span
            class="tag"
            style="border: dashed 1px #ccc; background: transparent; color: #999; cursor: pointer"
            @click="addColor"
            >+ 添加</span
          >
        </div>
      </div>
    </div> -->

    <div class="divider">其他</div>
    <div
      class="section"
      style="padding-bottom: 16px">
      <div class="section-row">
        <span
          class="label"
          style="min-width: auto"
          >快捷键</span
        >
        <span style="font-size: 11px; color: #666">Ctrl + R 刷新</span>
      </div>
      <div class="section-row">
        <span
          class="label"
          style="min-width: auto">
          OBS 捕获 弹幕窗默认监听所有当前连接的直播间弹幕，如果需要指定直播间请修改 roomId={直播间号}
        </span>
      </div>
      <div class="section-row">
        <span class="hint">弹幕窗</span>
        <span
          class="url-tag"
          @click="copyObsUrl(obsDmUrl)">
          {{ obsDmUrl }}
        </span>
        <span
          class="tip-icon"
          @click="copyObsUrl(obsDmUrl)">
          <Icon
            type="md-copy"
            size="14"
            color="#999" />
        </span>
      </div>
      <div class="section-row">
        <span class="hint">原生弹幕窗</span>
        <span
          class="url-tag"
          @click="copyObsUrl(obsRawUrl)">
          {{ obsRawUrl }}
        </span>
        <span
          class="tip-icon"
          @click="copyObsUrl(obsRawUrl)">
          <Icon
            type="md-copy"
            size="14"
            color="#999" />
        </span>
      </div>
    </div>
    <div class="divider">关于</div>
    <div
      class="section"
      style="padding-bottom: 16px">
      <div class="section-row">
        <span
          class="label"
          style="min-width: auto"
          >下载</span
        >
        <span
          class="download-link"
          @click="openGithub">
          <Icon
            type="logo-github"
            size="18" />
          <span>GitHub</span>
        </span>
        <span
          class="download-link"
          @click="openBaiduNetdisk">
          <Icon
            type="md-cloud-download"
            size="18" />
          <span>百度网盘</span>
        </span>
      </div>
      <div class="section-row">
        <span
          class="label"
          style="min-width: auto">
          如有问题请向
          <span
            class="about-link"
            @click="openBiliSpace">
            @其妙
          </span>
          反馈
        </span>
      </div>
      <div class="section-row">
        <span
          class="label"
          style="min-width: auto"
          >版本</span
        >
        <span class="about-val">v{{ version }}</span>
      </div>
    </div>
    <!-- ═══ 扫码登录弹窗 ═══ -->
    <Modal
      v-model="showQrModal"
      title="扫码登录"
      width="300">
      <div style="text-align: center">
        <canvas
          id="qrcode"
          width="200"
          height="200"></canvas>
        <p
          v-if="qrError"
          style="color: red; margin-top: 8px">
          {{ qrError }}
        </p>
        <p>请在手机上扫码并确认之后，再点击确认</p>
      </div>
    </Modal>

    <Drawer
      title="关于弹幕用户名不显示说明"
      placement="bottom"
      height="80"
      :closable="true"
      v-model="showDrawTip">
      <p>由于B站风控策略限制，未登录用户无法查看用户名、ID</p>
      <p>您可以通过 <Icon type="md-settings" />设置页面，通过设置B站Cookie赋予登录态。（弹幕功能任意用户Cookie即可）</p>
      <p>获取Cookie说明：打开浏览器控制台，点击任意B站请求，Headers中可查看Cookie，<strong>完整复制粘贴</strong>到设置中</p>
      <p>目前已支持APP端扫码登录</p>
      <p :style="{ color: 'crimson' }">Cookie需要定时更新，如果遇到无法显示弹幕，可能是Cookie已过期，请更新或清空Cookie</p>
      <img src="../assets/tip-01.png" />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { get as _get, set as _set } from 'lodash'
import config from '../service/config'
import { updateClientConfig, restoreDmStyle, generateQRCode, sendDM, clearDM as clearDMApi } from '../service/api'
import { IPC_GET_VERSION } from '../../service/const'
import globalVar from '../../service/global'
import QRCode from 'qrcode'
import draggable from 'vuedraggable'

const dmStyle = computed(() => config.dmStyle)
const dmRawStyle = computed(() => config.dmRawStyle)
const liveConfig = computed(() => config.liveConfig)
const recordConfig = computed(() => config.recordConfig)
const chartConfig = computed(() => config.chartConfig)
const clientId = computed(() => config.id)

// ── Cookie ──
const cookieInput = ref('')
const showQrModal = ref(false)
const qrError = ref('')
const showDrawTip = ref(false)

// ── 等级样式 ──
const activeLevel = ref('0')
const iconOpen = ref(false)
const adminIcons = ['md-star', 'md-ribbon', 'md-flash', 'md-hammer', 'md-key', 'md-lock', 'md-flag']

interface LevelStyle {
  usernameColor?: string
  usernameFontSize?: number
  usernameStrokeColor?: string
  usernameStrokeWidth?: number
  commentColor?: string
  commentFontSize?: number
  commentStrokeColor?: string
  commentStrokeWidth?: number
  bgColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
}

const currentLevelStyle = computed((): LevelStyle => {
  const lv = activeLevel.value
  const s = dmStyle.value
  if (!s) return {}
  const suffix = lv === 'Interact' ? 'Interact' : lv
  const container = (s as any)[`messageContainer${suffix}`] || {}
  const username = (s as any)[`messageUsername${suffix}`] || {}
  const comment = (s as any)[`messageComment${suffix}`] || {}
  return {
    usernameColor: username['color'],
    usernameFontSize: username['font-size'] ? parseFloat(username['font-size']) || undefined : undefined,
    usernameStrokeColor: username['-webkit-text-stroke-color'],
    usernameStrokeWidth: username['-webkit-text-stroke-width'] ? parseFloat(username['-webkit-text-stroke-width']) || 0 : 0,
    commentColor: comment['color'],
    commentFontSize: comment['font-size'] ? parseFloat(comment['font-size']) || undefined : undefined,
    commentStrokeColor: comment['-webkit-text-stroke-color'],
    commentStrokeWidth: comment['-webkit-text-stroke-width'] ? parseFloat(comment['-webkit-text-stroke-width']) || 0 : 0,
    bgColor: container['background'],
    borderColor: container['border-color'],
    borderWidth: container['border-width'] ? parseFloat(container['border-width']) || 0 : 0,
    borderRadius: container['border-radius'] ? parseFloat(container['border-radius']) || 0 : 0,
  }
})

// ── 工具函数 ──
function setVal(path: string, value: any) {
  _set(config, path, value)
  updateClientConfig({
    clientId: clientId.value,
    kvs: [
      {
        key: path,
        value,
      },
    ],
  }).catch(e => {
    console.error(e)
  })
}

function toggle(path: string) {
  const cur = _get(config, path, false)
  setVal(path, !cur)
}

function toggleSlot(type: string) {
  const slots = [...(dmStyle.value?.messageSlots || [])]
  const slot = slots.find(s => s.type === type)
  if (slot) {
    slot.isShow = !slot.isShow
    setVal('dmStyle.messageSlots', slots)
  }
}

const slotNameMap: Record<string, string> = { medal: '粉丝牌', face: '头像', name: '昵称', comment: '内容' }

const slotItems = computed({
  get: () => dmStyle.value?.messageSlots || [],
  set: slots => setVal('dmStyle.messageSlots', slots),
})

function onSlotDragEnd() {
  setVal('dmStyle.messageSlots', slotItems.value)
}

function stepUp(path: string, defaultVal: number, max: number, step: number) {
  const cur = _get(config, path, defaultVal)
  setVal(path, Math.min(max, cur + step))
}

function stepDown(path: string, defaultVal: number, min: number, step: number) {
  const cur = _get(config, path, defaultVal)
  setVal(path, Math.max(min, cur - step))
}

function setLevelStyleColor(target: 'user' | 'comment' | 'bg' | 'userStroke' | 'commentStroke' | 'border', color: string) {
  const lv = activeLevel.value
  const suffix = lv === 'Interact' ? 'Interact' : lv
  if (target === 'user') {
    setVal(`dmStyle.messageUsername${suffix}.color`, color)
  } else if (target === 'comment') {
    setVal(`dmStyle.messageComment${suffix}.color`, color)
  } else if (target === 'bg') {
    setVal(`dmStyle.messageContainer${suffix}.background`, color)
  } else if (target === 'userStroke') {
    setVal(`dmStyle.messageUsername${suffix}.-webkit-text-stroke-color`, color)
  } else if (target === 'commentStroke') {
    setVal(`dmStyle.messageComment${suffix}.-webkit-text-stroke-color`, color)
  } else if (target === 'border') {
    setVal(`dmStyle.messageContainer${suffix}.border-color`, color)
  }
}

function setLevelStyle(key: string, value: any) {
  const lv = activeLevel.value
  const suffix = lv === 'Interact' ? 'Interact' : lv
  if (key === 'userFontSize') {
    setVal(`dmStyle.messageUsername${suffix}.font-size`, `${value}px`)
  } else if (key === 'commentFontSize') {
    setVal(`dmStyle.messageComment${suffix}.font-size`, `${value}px`)
  } else if (key === 'userStrokeWidth') {
    setVal(`dmStyle.messageUsername${suffix}.-webkit-text-stroke-width`, `${value}px`)
  } else if (key === 'commentStrokeWidth') {
    setVal(`dmStyle.messageComment${suffix}.-webkit-text-stroke-width`, `${value}px`)
  } else if (key === 'borderWidth') {
    setVal(`dmStyle.messageContainer${suffix}.border-width`, `${value}px`)
  } else if (key === 'borderRadius') {
    setVal(`dmStyle.messageContainer${suffix}.border-radius`, `${value}px`)
  }
}

// ── 色彩表 ──
function addColor() {
  const colors = [...(chartConfig.value?.colors || []), '#2d8cf0']
  setVal('chartConfig.colors', colors)
}

function removeColor(index: number) {
  const colors = [...(chartConfig.value?.colors || [])]
  colors.splice(index, 1)
  setVal('chartConfig.colors', colors)
}

// ── 测试弹幕 ──
async function selectAdminIcon(icon: string) {
  setVal('dmStyle.adminIcon', icon)
  iconOpen.value = false
}

function selectNoIcon() {
  setVal('dmStyle.adminIcon', '')
  iconOpen.value = false
}

async function sendTestDanmaku() {
  try {
    await sendDM('danmaku', {
      username: '测试用户',
      comment: '这是一条测试弹幕 🎉',
    })
  } catch {
    /* ignore */
  }
}

async function clearDM() {
  try {
    await clearDMApi()
  } catch {
    /* ignore */
  }
}

async function restoreDmDefaults() {
  try {
    const { data } = await restoreDmStyle({ clientId: clientId.value })
    // 恢复后重新拉取配置更新本地状态

    if (data) {
      config.dmStyle = data.dmStyle
    }
  } catch {
    /* ignore */
  }
}

// ── 保存路径 ──
function selectSavePath() {
  ;(window as any).ipcRenderer.invoke('select-directory').then((path: string | null) => {
    if (path) setVal('recordConfig.savePath', path)
  })
}

// ── 扫码登录 ──
async function showQrCodeLoginModal() {
  showQrModal.value = true
  qrError.value = ''
  try {
    const res = await generateQRCode()
    const { url } = res.data
    setTimeout(() => {
      const canvas = document.getElementById('qrcode') as HTMLCanvasElement
      if (canvas) QRCode.toCanvas(canvas, url)
    }, 100)
  } catch {
    qrError.value = '二维码加载失败'
  }
}

// ── Cookie 提示 ──
function showCookieTip() {
  showDrawTip.value = true
}

// ── 关于 ──
const version = ref(0)
const baseObsUrl = computed(() => `http://127.0.0.1:${(globalVar as any).port}`)
const obsDmUrl = computed(() => `${baseObsUrl.value}/dm?clientId=${clientId.value}&roomId=*`)
const obsRawUrl = computed(() => `${baseObsUrl.value}/dm-raw-style?clientId=${clientId.value}&roomId=*`)

onMounted(async () => {
  version.value = await (window as any).ipcRenderer.invoke(IPC_GET_VERSION)
})

function openGithub() {
  window.openExternal('https://github.com/usagiring/bilibili-live-danmaku/releases')
}

function openBiliSpace() {
  window.openExternal('https://space.bilibili.com/55609')
}

function openBaiduNetdisk() {
  window.openExternal('https://pan.baidu.com/share/init?surl=E3Tr0SCojOzGgrGBDOdouA&pwd=2bjw')
}

function copyObsUrl(url: string) {
  navigator.clipboard.writeText(url).catch(() => {
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  })
}

// // ── 还原默认 ──
// function restoreDefaults() {
//   const defaults: Record<string, any> = {
//     isShowFace: true,
//     isShowFanMedal: true,
//     isShowHeadline: true,
//     isShowType1: true,
//     isShowType2: true,
//     windowOpacity: 1,
//     font: 'auto',
//     fontWeight: 'normal',
//     faceSize: 28,
//     combineSimilarTime: 3000,
//     hiddenExpiredTime: 0,
//     showGiftCardThreshold: 0,
//     showHeadlineThreshold: 0,
//     isShowInteractInfo: false,
//     isShowSilverGift: false,
//     isShowSuperChatJPN: true,
//     isShowAnchorIcon: true,
//     isShowAdminIcon: false,
//     isWindowAlwaysOnTop: false,
//   }
//   const current = dmStyle.value || {}
//   _set(config, 'dmStyle', { ...current, ...defaults })
// }
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0 0 20px;
  background: #fff;
}

.section {
  padding: 0 16px;
}

.section-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  flex-wrap: wrap;
}

.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.tip-icon:hover {
  opacity: 0.8;
}

.url-tag {
  display: inline-block;
  padding: 1px 8px;
  font-size: 11px;
  font-family: monospace;
  color: #555;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #e8eaec;
  cursor: pointer;
  user-select: all;
  transition: background 0.15s;
}

.url-tag:hover {
  background: #e8f0fe;
  border-color: #2d8cf0;
}

.about-val {
  font-size: 11px;
  color: #999;
}

.about-link {
  color: #2d8cf0;
  cursor: pointer;
  padding: 0 2px;
}

.about-link:hover {
  text-decoration: underline;
}

.download-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: #555;
  background: #f5f5f5;
  border: 1px solid #e8eaec;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.download-link:hover {
  color: #2d8cf0;
  background: #e8f0fe;
  border-color: #2d8cf0;
}

.label {
  font-size: 12px;
  color: #666;
  /* min-width: 54px; */
  white-space: nowrap;
  text-align: right;
}

.hint {
  font-size: 12px;
  /* color: black; */
  /* margin: 0 -3px */
}

.divider {
  display: flex;
  align-items: center;
  padding: 18px 16px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.divider::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #2d8cf0;
  border-radius: 2px;
  margin-right: 8px;
}

.input {
  height: 18px;
  border: none;
  border-bottom: 1.5px solid #ddd;
  border-radius: 0;
  padding: 2px 0px 0;
  font-size: 12px;
  line-height: 1;
  outline: none;
  background: transparent;
  text-align: center;
  transition: border-color 0.15s;
  font-family: inherit;
}

.input:focus {
  border-bottom-color: #2d8cf0;
}

.input-unit {
  font-size: 11px;
  color: #999;
  margin-left: 2px;
}

.btn {
  height: 26px;
  border: 1px solid #2d8cf0;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 11px;
  cursor: pointer;
}

.btn-primary {
  background: #2d8cf0;
  color: #fff;
  border: none;
}

.btn-default {
  background: #fff;
  color: #2d8cf0;
}

/* 步进器 */
.stepper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stepper-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  color: #999;
  line-height: 1;
  transition: 0.15s;
  user-select: none;
}

.stepper-btn:hover {
  border-color: #2d8cf0;
  color: #2d8cf0;
  background: #f0f5ff;
}

.stepper-val {
  font-size: 12px;
  color: #333;
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.stepper-input {
  width: 36px;
  height: 18px;
  border: none;
  border-bottom: 1.5px solid #ddd;
  border-radius: 0;
  padding: 2px 0px 0;
  font-size: 12px;
  line-height: 1;
  outline: none;
  background: transparent;
  text-align: center;
  transition: border-color 0.15s;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
}

.stepper-input:focus {
  border-bottom-color: #2d8cf0;
}

/* 预览 */
.preview {
  margin: 8px 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview .avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e88;
}

.preview .name {
  color: #6cf;
  font-size: 13px;
}

.preview .colon {
  color: #6cf;
  font-size: 13px;
}

.preview .msg {
  color: #ddd;
  font-size: 13px;
}

/* 芯片切换 */
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px 0;
}

/* 插槽排序框 */
.slot-box {
  position: relative;
  border: 1px solid #e8eaec;
  border-radius: 6px;
  padding: 12px 10px 6px;
  margin: 6px 0;
}

.slot-box-label {
  position: absolute;
  top: -8px;
  left: 10px;
  background: #fff;
  padding: 0 6px;
  font-size: 11px;
  color: #999;
}

.slot-chips {
  padding: 0;
}

/* 拖拽占位虚影 */
.slot-ghost {
  opacity: 0.3;
  background: #e8eaec;
  border-style: dashed;
}

.chip {
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  border: 1px solid #ddd;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
  user-select: none;
}

.chip.on {
  background: rgba(45, 140, 240, 0.08);
  border-color: #2d8cf0;
  color: #2d8cf0;
}

/* 下拉框 */
.select {
  height: 18px;
  border: none;
  border-bottom: 1.5px solid #ddd;
  border-radius: 0;
  /* padding: 9px 2px 0; */
  font-size: 12px;
  line-height: 1;
  outline: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: #333;
}

.select:focus {
  border-bottom-color: #2d8cf0;
}

/* 图标下拉 */
.icon-dropdown {
  position: relative;
  display: inline-flex;
}

.icon-trigger {
  width: 24px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1.5px solid #ddd;
  transition: border-color 0.15s;
}

.icon-trigger:hover {
  border-bottom-color: #2d8cf0;
}

.icon-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background: #fff;
  border: 1px solid #e8eaec;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 40px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s;
}

.icon-item:hover {
  background: #f0f5ff;
}

.icon-item.on {
  background: rgba(45, 140, 240, 0.08);
}

.icon-overlay {
  position: fixed;
  inset: 0;
  z-index: 9;
}

/* 分段胶囊 */
.segmented {
  display: inline-flex;
  background: #f0f2f5;
  border-radius: 11px;
  padding: 2px;
}

.seg-item {
  height: 20px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #999;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.15s;
  user-select: none;
}

.seg-item.on {
  background: #fff;
  color: #2d8cf0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* 等级分段 — 嵌在边框中 */
.slot-box--tabs {
  margin-top: 16px;
  padding-top: 16px;
}

.slot-box--tabs .lvl-tabs {
  position: absolute;
  top: -12px;
  left: 10px;
  display: inline-flex;
  gap: 0;
  margin: 0;
  background: #eeeeee;
  border: 1px solid #e8eaec;
  border-radius: 6px 6px 6px 6px;
  overflow: hidden;
}

.lvl-tab {
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #999;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: 0.15s;
  user-select: none;
  border-radius: 6px 6px 6px 6px;
}

.lvl-tab:last-child {
  border-right: none;
}

.lvl-tab.on {
  background: #fff;
  color: #2d8cf0;
}

/* 色彩标签 */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f0f0f0;
  font-size: 11px;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tag-close {
  cursor: pointer;
  color: #999;
  font-size: 10px;
  margin-left: 2px;
}

/* 颜色选择器 */
.color-pick {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.color-pick input[type='color'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  padding: 0;
  border: none;
}

/* 颜色圆点 */
.color-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

/* 滚动条 */
.page::-webkit-scrollbar {
  width: 3px;
}

.page::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
</style>
