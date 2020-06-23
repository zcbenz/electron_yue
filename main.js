const path = require('path')
const {app, webContents} = require('electron')
const gui = require('./gui')

const SIDEBAR_WIDTH = 68
const ITEM_HEIGHT = 56

global.win = null
global.page = null

app.once('ready', () => {
  // Create window.
  win = gui.Window.create({})
  win.setContentSize({width: 600, height: 500})
  win.onClose = () => app.quit()

  // The content view.
  const contentView = gui.Container.create()
  contentView.setStyle({flexDirection: 'row'})
  win.setContentView(contentView)

  // The sidebar.
  const sidebar = gui.Container.create()
  sidebar.setStyle({
    flexDirection: 'column',
    width: SIDEBAR_WIDTH,
  })
  sidebar.setBackgroundColor('#313245')
  createSidebarItems(sidebar)
  contentView.addChildView(sidebar)

  // The loading indicator.
  const loadingIndicator = gui.GifPlayer.create()
  loadingIndicator.setStyle({
    flex: 1,
  })
  const gifPath = path.join(__dirname, 'assets', 'loading@2x.gif')
  loadingIndicator.setImage(gui.Image.createFromPath(gifPath))
  loadingIndicator.setAnimating(true)
  contentView.addChildView(loadingIndicator)

  // Use Electron's WebContents.
  page = webContents.create({nodeIntegration: true})
  // Make the loading indicator show for a while.
  setTimeout(() => { page.loadFile(__dirname + '/index.html') }, 1000)

  // Replace loading indicator with webContents after page is loaded.
  page.once('did-finish-load', () => {
    const chrome = gui.ChromeView.create(page.getNativeView())
    chrome.setStyle({flex: 1})
    contentView.removeChildView(loadingIndicator)
    contentView.addChildView(chrome)
  })

  // Show window.
  win.center()
  win.activate()
})

function createSidebarItems(sidebar) {
  const padding = 2
  const iconSize = 20
  const font = gui.Font.create('system-ui', 10, 'normal', 'normal')

  let selectedItem = null
  const items = ['Activity', 'Chat', 'Teams', 'Calendar']
  for (const title of items) {
    const iconPath = path.join(__dirname, 'assets', title + '.png')
    const icon = gui.Image.createFromPath(iconPath)
    const text = gui.AttributedText.create(title, {
      color: '#FFF',
      align: 'center',
      font,
    })
    const textBounds = text.getBoundsFor({width: SIDEBAR_WIDTH, height: ITEM_HEIGHT})
    // Manually draw the sidebar item.
    const item = gui.Container.create()
    item.setStyle({
      width: '100%',
      height: ITEM_HEIGHT,
    })
    item.selected = false
    item.hover = false
    item.onDraw = (self, painter, dirty) => {
      // Background.
      if (item.selected || item.hover) {
        painter.setFillColor('#3B3E59')
        painter.fillRect(dirty)
      }
      if (item.selected) {
        painter.setFillColor('#E2E2F4')
        painter.fillRect({x: 0, y: 0, width: 4, height: ITEM_HEIGHT})
      }
      // Text.
      text.setColor((item.selected || item.hover) ? '#FFF': '#999')
      painter.drawAttributedText(text, {
        x: 0,
        y: (ITEM_HEIGHT - padding - textBounds.height - iconSize) / 2 + iconSize + padding,
        width: SIDEBAR_WIDTH,
        height: textBounds.height,
      })
      // Icon.
      painter.drawImage(icon, {
        x: (SIDEBAR_WIDTH - iconSize) / 2,
        y: (ITEM_HEIGHT - padding - textBounds.height - iconSize) / 2,
        width: iconSize,
        height: iconSize,
      })
    }
    // Mouse events.
    item.onMouseEnter = () => {
      item.hover = true
      item.schedulePaint()
    }
    item.onMouseLeave = () => {
      item.hover = false
      item.schedulePaint()
    }
    item.onMouseUp = (self, event) => {
      if (event.button === 1) {
        if (selectedItem) {
          selectedItem.selected = false
          selectedItem.schedulePaint()
          selectedItem = item
          selectedItem.selected = true
          selectedItem.schedulePaint()
        }
      }
    }
    sidebar.addChildView(item)
  }

  // Select first item by default.
  selectedItem = sidebar.childAt(0)
  selectedItem.selected = true
}
