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
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bandcamp Scraper</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <style>
        html, body {
            margin: 0;
            height: 100%;
        }

        table, tr, td {
            border: 1px solid;
            border-color: #01252C;
            color: #01252C;
        }

        thead > tr > td > div {
            display: flex;
            justify-content: center;
        }

        td {
            min-width: 15vw;
        }

        tbody > tr > td > a {
            text-decoration: underline;
            color: #01252C;

            > div {
                display: flex;
                justify-content: center;
            }
        }
    </style>
    <script>
        async function parse(callback, url) {
            let value_before = document.getElementById("input_url");
            if (!value_before) {
                value_before = url
            }

            if (!url) {
                value_before = value_before.value.trim()
            }
            const container = document.getElementById('container');
            container.innerHTML = \`
            <div style="display: flex; flex-direction: row; position: fixed; border: 4px solid; border-radius: 10vw; min-height: 1vh; height: 40px; margin-top: -60vh; padding: 0 20px 0 20px; background-color: white; width: 50vw; justify-content: space-between; border-color: #01252C;">
                <input id="input_url" style="border-style: none; outline: none; min-width: 1vw; width: 100vw;" type="text" placeholder="Paste Bandcamp album URL">
                <div style="display: flex; align-items: center;">
                    <span id="search_btn" class="material-symbols-outlined" onclick="parse(addHistory)" style="cursor: pointer;">search</span>
                </div>
            </div>
            <div id="content" style="padding-top: 1vw; padding-bottom: 40vh;"></div>\`

            document.getElementById("input_url").value = value_before;
            const ctn = document.getElementById("content");
            ctn.innerHTML = '';

            if (value_before) {
                if (callback) {
                    callback(value_before);
                }
                const loading = document.createElement("span");
                loading.innerText = "loading...";
                ctn.appendChild(loading);
                const response = await fetch(\`/parse?url=\${value}\`);
                const trackinfoObject = await response.json();
                if (trackinfoObject.status === 200) {
                    const tbl = document.createElement("table");
                    const thead = document.createElement("thead");
                    const tblBody = document.createElement("tbody");

                    const headTr = document.createElement("tr");
                    const headTitle = document.createElement("td");
                    const headUrl = document.createElement("td");

                    const div_title = document.createElement("div");
                    div_title.innerText = 'Title';
                    const div_link = document.createElement("div");
                    div_link.innerText = 'Link';

                    headTitle.appendChild(div_title);
                    headUrl.appendChild(div_link);

                    headTr.appendChild(headTitle);
                    headTr.appendChild(headUrl);
                    thead.appendChild(headTr);

                    for (let i = 0; i < trackinfoObject.trackinfo.length; i++) {
                        const row = document.createElement("tr");

                        const cell_title = document.createElement("td");
                        const cell_url = document.createElement("td");
                        cell_title.innerText = trackinfoObject.trackinfo[i].title;
                        cell_url.innerHTML = \`<a href="\${trackinfoObject.trackinfo[i].file["mp3-128"]}"><div>grab it!</div></a>\`;

                        row.appendChild(cell_title);
                        row.appendChild(cell_url);
                        tblBody.appendChild(row);
                    }

                    tbl.appendChild(thead);
                    tbl.appendChild(tblBody);
                    ctn.innerHTML = '';
                    ctn.appendChild(tbl);

                } else {
                    const err = document.createElement("span");
                    err.innerText = "error: invalid input";
                    ctn.innerHTML = '';
                    ctn.appendChild(err);
                }
            } else {
                const loading = document.createElement("span");
                loading.innerText = "error: input can't be blank";
                ctn.appendChild(loading);
            }
        }

        function addHistory(v) {
            if (!Object.values(localStorage).includes(v)) {
                localStorage.setItem(localStorage.length, v);
            }
        }

        async function history() {
            location.href = '#history';
            const container = document.getElementById('container');
            const content = document.getElementById('content');
            container.innerHTML = '';
            content.innerHTML = '';
            let links = []

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            
            const tr_head = document.createElement('tr');
            const td_head = document.createElement('td');

            const div = document.createElement('div');
            div.innerText = 'history';

            td_head.appendChild(div);
            tr_head.appendChild(td_head);
            thead.appendChild(tr_head);
            table.appendChild(thead);

            for (let i = localStorage.length - 1; i >= 0; i--) {
                links.push(localStorage.getItem(i.toString()));
                const tr_body = document.createElement('tr');
                const td_body = document.createElement('td');
                const anchor = document.createElement('a');
                anchor.setAttribute('onclick', \`parse(undefined, "\${localStorage.getItem(i)}")\`);
                anchor.setAttribute('style', 'cursor: pointer')

                anchor.innerText = localStorage.getItem(i.toString());
                td_body.appendChild(anchor);
                tr_body.appendChild(td_body);
                tbody.appendChild(tr_body);
            }
            table.appendChild(tbody);
            content.appendChild(table);
            container.appendChild(content);

			if (localStorage.length === 0) {
				content.innerHtml = '';
				content.innerText = 'not found'
			}
        }

        document.addEventListener("DOMContentLoaded", function() {
            const url = document.getElementById("input_url");
            url.addEventListener("keyup", (event) => {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    parse(addHistory);
                }
            });
        });
    </script>
</head>
<body>
    <div style="display: flex; align-items: center; flex-direction: column; background-color: #01252C; height: 100%;">
        <div style="display: flex; flex-direction: row; justify-content: center; border: 3px solid; min-width: 100vw; border-radius: 0px 0px 5vh 5vh; border-left: 0; border-top: 0; border-right: 0; background-color: #2b8666;">
            <div style="padding: 2vh 0vw 2vh 0vw;">
                <nav style="display: flex; flex-direction: row; justify-content: space-between; min-width: 410px;">
                    <button style="min-width: 200px; min-height: 60px; max-width: 100vw; border-radius: 10vw; border: 3px solid; background-color: #88DF95; border-color: #01252C; cursor: pointer" onclick="location.href = '/'">home</button>
                    <button style="min-width: 200px; min-height: 60px; max-width: 100vw; border-radius: 10vw; border: 3px solid; background-color: #88DF95; border-color: #01252C; cursor: pointer" onclick="history()">history</button>
                </nav>
            </div>
        </div>
        <div style="display: flex; height: 300px; justify-content: center;">
            <img src="https://raw.githubusercontent.com/booleanism/bdown/main/public/logo.svg" alt="logo" width="80%">
        </div>
        <div id="container" style="display: flex; flex-direction: column; border: 0px solid; min-width: 100vw; border-radius: 90px 90px 0px 0px / 90px 90px 0vh 0vh; min-height: 60vh; justify-content: center; border-bottom: 0; border-left: 0; border-right: 0; align-items: center; background-color: #88DF95;">
            <div style="display: flex; flex-direction: row; position: fixed; border: 4px solid; border-radius: 10vw; min-height: 1vh; height: 40px; margin-top: -60vh; padding: 0 20px 0 20px; background-color: white; width: 50vw; justify-content: space-between; border-color: #01252C;">
                <input id="input_url" style="border-style: none; outline: none; min-width: 1vw; width: 100vw;" type="text" placeholder="Paste Bandcamp album URL">
                <div style="display: flex; align-items: center;">
                    <span id="search_btn" class="material-symbols-outlined" onclick="parse(addHistory)" style="cursor: pointer;">search</span>
                </div>
            </div>
            <div id="content" style="padding-top: 1vw; padding-bottom: 40vh;"></div>   
        </div>
    </div>
</body>
</html>`;

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

		const jsonData = data.replaceAll(/&quot;/g, '"').replaceAll('&amp;', '&').replaceAll('&alt;', '<').replaceAll('&gt;', '>').replaceAll('&#039;', "'");

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
