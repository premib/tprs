const secondCalls = () => {

  let checkForTname = document.getElementById("tname1");
    
  if(typeof(checkForTname) != "undefined" && checkForTname != null){
    return;
  }
  
  let url = "http://localhost:8080";
  let file = "queryAllResult";
  let id = encodeURIComponent(document.getElementById("name").value);
  let pass = encodeURIComponent(document.getElementById("password").value);
  
  console.log(`${id} ${pass} `);
  let request = new XMLHttpRequest();
  console.log(`${url}/api/${file}/${id}/${pass}`);
  request.open('GET', `${url}/api/${file}/${id}/${pass}`, true);

  request.onload = () => {
      
  
    document.getElementById("table").style.visibility='visible';
    
    let data = JSON.parse(request.response);
    let array = JSON.parse(data.response);
    console.log(array[0].value);
    document.getElementById("table").style.display='block';
    let table = document.getElementById("table");
    let iter = 1;
    
    for(let final of array){

      //headers for each semester sheet
      let trow = table.insertRow(iter++);
      let tcell0 = trow.insertCell(0);
      let tcell1 = trow.insertCell(1);
      let tcell2 = trow.insertCell(2);
      let tcell3 = trow.insertCell(3);

      tcell0.innerHTML = "<h4>Result Sheet for: </h4>";
      tcell1.innerHTML = `<h4>Year ${final.value.year}</h4>`;
      tcell2.innerHTML = `<h4>Semester ${final.value.semester}</h4>`;
      tcell3.innerHTML = `<h4>Cert Version ${final.value.certificateVersion}</h4>`;

      //essential informations
      let tname = table.insertRow(iter++);
      tname.setAttribute("id","tname1");
      let tnamecell0 = tname.insertCell(0);
      let tnamecell1 = tname.insertCell(1);
      tnamecell0.innerHTML = "Name";
      tnamecell1.innerHTML = final.value.name;
      let treg = table.insertRow(iter++);
      let tregcell0 = treg.insertCell(0);
      let tregcell1 = treg.insertCell(1);
      tregcell0.innerHTML = "Registration Number";
      tregcell1.innerHTML = final.value.reg;
      let tcc = table.insertRow(iter++);
      let tcccell0 = tcc.insertCell(0);
      let tcccell1 = tcc.insertCell(1);
      tcccell0.innerHTML = "College Code";
      tcccell1.innerHTML = final.value.collegeCode;
      let tcourse = table.insertRow(iter++);
      let tcoursecell0 = tcourse.insertCell(0);
      let tcoursecell1 = tcourse.insertCell(1);
      tcoursecell0.innerHTML = "Course Id";
      tcoursecell1.innerHTML = final.value.course_id;
      
      if(typeof(final.value.marks) != 'object'){
        final.value.marks = JSON.parse(final.value.marks);
      }
      for(key in final.value.marks){
        console.log(key);
        let element =  document.getElementById('row'+iter);
        if (typeof(element) != 'undefined' && element != null){

          document.getElementById('row'+iter).parentNode.removeChild(document.getElementById('row'+iter));
        }
        
        let row = table.insertRow(iter);
        row.setAttribute("id","row"+iter);

        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);

        cell0.innerHTML = key;
        cell1.innerHTML = final.value.marks[key];

        iter += 1;
      }

      //other information
      let tcreationtime = table.insertRow(iter++);
      let tcreationtimecell0 = tcreationtime.insertCell(0);
      let tcreationtimecell1 = tcreationtime.insertCell(1);
      tcreationtimecell0.innerHTML = "Creation Time";
      tcreationtimecell1.innerHTML = final.value.creationTime;
      let ttid = table.insertRow(iter++);
      let ttidcell0 = ttid.insertCell(0);
      let ttidcell1 = ttid.insertCell(1);
      ttidcell0.innerHTML = "Transaction Id";
      ttidcell1.innerHTML = final.value.transaction_id;
    }
  }

  request.onerror = (error) => {
    // let temp = JSON.parse(request.response);
    console.log(`${request.response.error},asd s${request.responseText}, ${request.responseType}, ${request.response.toString()}  , ${request}`);
   
    for(let key in request){
      console.log(key, request[key]);
    }
  }
 if(request.status == 500){
   console.log("asdsasa");
 }
  request.send()
  
}
  
  
const onceOpen = () =>  document.getElementById("table").style.display='none';
    
  