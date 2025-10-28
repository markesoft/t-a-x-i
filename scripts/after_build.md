add this line to .output\server\chunks\_\nitro.mjs after imports

/* add by baek */
import { dirname as drnm } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = drnm(__filename)
/* end my block */


**chage module.json**
"compatibility": {
    "nuxt": "^4.0.0"
  },

C:\DataWork\MyWork\Projet_eSGI\eSGM_src\node_modules\nuxt-particles\dist\module.json
C:\DataWork\MyWork\Projet_eSGI\eSGM_src\node_modules\nuxt-particles\dist\module.mjs


C:\DataWork\MyWork\Projet_eSGI\eSGM_src\node_modules\@samk-dev\nuxt-vcalendar\dist\module.json
C:\DataWork\MyWork\Projet_eSGI\eSGM_src\node_modules\@samk-dev\nuxt-vcalendar\dist\module.mjs