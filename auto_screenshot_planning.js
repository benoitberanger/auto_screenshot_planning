// load libs
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');

// Load my credentions from txt files
const homedir = os.homedir();
const cred_path = path.join(homedir, 'credentials_auto_screenshot_planning');
var fs = require('fs');
var CREDS = JSON.parse(fs.readFileSync(cred_path, 'utf8'));

// Main
(async () => {
  
  // init headless webpage
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  console.log('headless webpage opened')
  
  // login to website
  await page.goto('http://reservation.cenir.org/login.php');
  await page.type('#login', CREDS.username);
  await page.type('[type="password"]', CREDS.password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  console.log('login successfull')
  
  // get date
  var date  = new Date();
  var timestamp = date.toISOString().split('T')[0]; // will be YYYY-MM-DD
  
  fpath = `/network/lustre/iss01/cenir/analyse/irm/studies/cenir/screenshots_planning/${timestamp}/`;
  fs.mkdir( fpath, { recursive: true }, (err) => {
     if (err) {
       return console.error(err);
     }
     console.log('directory created successfully')
  });

  var area = {
    mri: 1,
    meg: 4,
    eeg: 10,
    behaviour: 11,
    brucker: 9,
    TMS: 12,
    pfmarche: 14,
    meeting: 2,
    abs: 3,
  }
  
  // Loop : print a screenshot for this week and the 4 next ones
  for (i=0; i<5; i++){
    
    if (i>0) date.setDate(date.getDate() + 7);
    
    var year  = date.getFullYear();
    var month = date.getMonth()+1;
    var day   = date.getDate();
    
    for (var key in area) {
      
      var room = area[key];
      
      // got the pritable page
      await page.goto(`http://reservation.cenir.org/week_all.php?day=${day}&month=${month}&year=${year}&area=${room}&pview=1`)
      
      // Set page size
      if (key=='mri'){
        await page.setViewport({
          width: 800,
          height: 1800,
        });
      }
      else {
        await page.setViewport({
          width: 800,
          height: 600,
        });
      }
      
      // Print
      fname = `/network/lustre/iss01/cenir/analyse/irm/studies/cenir/screenshots_planning/${timestamp}/${timestamp}_planning_${key}_${i}.png`;
      console.log(fname);
      await page.screenshot({ path: fname });
      
    }
  }
  
  // cleanup
  console.log('cleaning up')
  await browser.close();
  console.log('all done')
  
})();
