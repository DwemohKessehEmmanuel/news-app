const searchForm = document.querySelector('.search');
const input = document.querySelector('.input');
const newsList = document.querySelector('.news-list');
const buttonEl = document.querySelector(".btn");


searchForm.addEventListener('submit', retrieve)

        function retrieve(e){
            
            newsList.innerHTML = ''

            e.preventDefault()

            const apiKey = '53d6909b8da143989e4526c7216ad938'
            
            let topic = input.value;
            
            let url = `https://newsapi.org/v2/everything?q=${topic}&apiKey=${apiKey}`

            fetch(url).then((res)=>{
                return res.json()
            }).then((data)=>{
                console.log(data)
                data.articles.forEach(article=>{
                    let li = document.createElement('li');
                    let a = document.createElement('a');
                    a.setAttribute('href', article.url);
                    a.setAttribute('target', '_blank')
                    a.setAttribute('style','color:brown')
                    a.textContent = article.title;
                    li.appendChild(a);
                    newsList.appendChild(li);
                })
            })

            
 
            console.log(topic)
        }

        buttonEl.addEventListener("mouseover",(event)=>{
            const x = (event.pageX - buttonEl.offsetLeft)
            const y = (event.pageY - buttonEl.offsetTop)
        
            buttonEl.style.setProperty("--xPos", x + "px")
            buttonEl.style.setProperty("--yPos", y + "px")
        }) 
        