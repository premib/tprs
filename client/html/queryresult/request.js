const calls = () => {

  let url = "http://13.233.59.193:8080";
  let file = "queryResult";
  let id = encodeURIComponent(document.getElementById("name").value);
  let pass = encodeURIComponent(document.getElementById("password").value);
  
  console.log(`${id} ${pass} `);
  var request = new XMLHttpRequest();
  console.log(`${url}/api/${file}/${id}/${pass}`);
  request.open('GET', `${url}/api/${file}/${id}/${pass}`, true);

  request.onload = () => {

      document.getElementById("table").style.visibility='visible';
      
      var data = JSON.parse(request.response);
      let final = JSON.parse(data.response);
      document.getElementById("table").style.display='block';
      document.getElementById("tname").innerHTML=final.name;
      document.getElementById("treg").innerHTML=final.reg;
      document.getElementById("tcollegecode").innerHTML=final.collegeCode;
      document.getElementById("tcourseid").innerHTML= final.course_id;
      document.getElementById("tcertificateversion").innerHTML = final.certificateVersion;
      document.getElementById("tyearsemester").innerHTML =final.year+" - "+final.semester;
      document.getElementById("tcreationtime").innerHTML=final.creationTime;
      document.getElementById("ttransactionid").innerHTML=final.transaction_id;

      let table = document.getElementById("table");
      let iter = 0 ;
      
      if(typeof(final.marks) != 'object'){
        final.marks = JSON.parse(final.marks);
        console.log("in");
      }
      for(key in final.marks){
        var element =  document.getElementById('row'+iter);
        if (typeof(element) != 'undefined' && element != null){

          document.getElementById('row'+iter).parentNode.removeChild(document.getElementById('row'+iter));
        }
        
        let row = table.insertRow(8+ iter);
        row.setAttribute("id","row"+iter);

        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);

        cell0.innerHTML = key;
        cell1.innerHTML = final.marks[key];

        console.log(`${row},${cell0},${cell1}`);

        iter += 1;
      }
  }

  request.onerror = () => console.log(`${request.response.error},asd ${request.responseText}, ${request.responseType}`);
  request.send()
  
}


const onceOpen = () =>  document.getElementById("table").style.display='none';
  
