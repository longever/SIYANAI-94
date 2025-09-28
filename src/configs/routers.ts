import INDEX from '../pages/index.jsx';
import CREATE from '../pages/create.jsx';
import MEMBERSHIP from '../pages/membership.jsx';
import DIGITAL_HUMAN from '../pages/digital-human.jsx';
import EXPORT_SHARE from '../pages/export-share.jsx';
import AI_VIDEO-CREATOR from '../pages/ai-video-creator.jsx';
import ASSET_LIBRARY from '../pages/asset-library.jsx';
export const routers = [{
  id: "index",
  component: INDEX
}, {
  id: "create",
  component: CREATE
}, {
  id: "membership",
  component: MEMBERSHIP
}, {
  id: "digital-human",
  component: DIGITAL_HUMAN
}, {
  id: "export-share",
  component: EXPORT_SHARE
}, {
  id: "ai-video-creator",
  component: AI_VIDEO-CREATOR
}, {
  id: "asset-library",
  component: ASSET_LIBRARY
}]