/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { AutoRouter } from 'itty-router';

const router = AutoRouter();

async function template() {
	const html = `<!DOCTYPE html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <title>BDown</title>
        <style>
            table, th, td {
                border: 1px solid black;
            }
    
            th, td {
                font-size: 1.5vw;
            }
    
            .center {
                display: flex; 
                justify-content: center;
            }
        </style>
        </head>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const url = document.getElementById("input_url");
                url.addEventListener("keyup", (event) => {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                        parse();
                    }
                });
            });

            async function parse() {
                const value = document.getElementById("input_url").value.trim();
				const ctn = document.getElementById("content");
				ctn.innerHTML = '';
				// ctn.innerHTML = "<span>loading...</span>
				
				if (value) {
					const loading = document.createElement("span")
					loading.innerText = "loading...";
					ctn.appendChild(loading);
					const trackinfoObject = JSON.parse(await (await fetch(\`/parse?url=\${value}\`)).text());
					console.log(trackinfoObject.status);
					if (trackinfoObject.status === 200) {
						const tbl = document.createElement("table");
						const thead = document.createElement("thead");
						const tblBody = document.createElement("tbody");
	
						const headTr = document.createElement("tr");
						const headTitle = document.createElement("td");
						const headUrl = document.createElement("td");
						headTitle.innerText = "Title"
						headUrl.innerText = "Download Link"
	
						headTr.appendChild(headTitle);
						headTr.appendChild(headUrl);
						thead.appendChild(headTr);
	
						for (var i = 0; i < trackinfoObject.trackinfo.length; i++) {
							const row = document.createElement("tr");
	
							const cell_title = document.createElement("td");
							const cell_url = document.createElement("td");
							cell_title.innerText = trackinfoObject.trackinfo[i].title;
							cell_url.innerHTML = \`<a href=\"\${trackinfoObject.trackinfo[i].file["mp3-128"]}\"}>Download</a>\`;
	
							row.appendChild(cell_title)
							row.appendChild(cell_url)
							tblBody.appendChild(row)
						}
	
						tbl.appendChild(thead);
						tbl.appendChild(tblBody);
						tbl.setAttribute("border", "1");
						ctn.innerHTML = '';
						ctn.appendChild(tbl);
					} else {
						const err = document.createElement("span")
						err.innerText = "error: invalid input";
						ctn.innerHTML = '';
						ctn.appendChild(err);
					}
				} else {
					const loading = document.createElement("span")
					loading.innerText = "error: input can't be blank";
					ctn.appendChild(loading);
				}
            }
        </script>
        <body>
        <div style="display: flex; align-items: center; flex-direction: column; padding-top: 15vw;">
            <div style="display: flex; border: solid; border-radius: 1vw; padding: 0 1vw 0 1vw;">
                <input id="input_url" style="border-style: none; min-width: 25vw; min-height: 1.5vw; outline: none;" type="text" placeholder="Paste Bandcamp album URL">
                <div style="display: flex; align-items: center;">
                    <span id="search_btn" class="material-symbols-outlined" onclick="parse()" style="cursor: pointer;">search</span>
                </div>
            </div>
            <div id="content" style="padding-top: 1vw;"></div>
        </div>
        </body>`;

	return new Response(html, {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
	});
}

async function parse(url) {
	if (url !== '') {
		const res = await fetch(url, { method: 'GET' });
		const data = await res.text();

		const jsonData = data.replace(/&quot;/g, '"');

		const pattern = /"trackinfo":\[(.*?)\]/;

		const match = jsonData.match(pattern);

		if (match) {
			const trackinfoString = `{${match[0]}}`;
			const trackinfoObject = JSON.parse(trackinfoString);
			trackinfoObject['status'] = 200;

			return new Response(JSON.stringify(trackinfoObject), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} else {
			const err = {
				status: 500
			}
			return new Response(JSON.stringify(err), {
				headers: {
					'Content-Type': 'application/json',
				}
			});
		}
	}
}

router.get('/', async (req) => {
	return template();
});

router.get('/parse', async (req) => {
	return parse(req.query.url);
});

export default { ...router };
