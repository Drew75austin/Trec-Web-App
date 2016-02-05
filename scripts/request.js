//annonymous ready function
$(function () {
    $("#submitRequest").on('click', function () {
        soapRequest();
    });
    $("#cancel").on('click', function () {
        $("#requestXML").val("");
        $("#requestResultLabel").addClass('hidden');
        $("#responseTable").empty();
        return false;
    });

    function soapRequest() {

        var trecServiceURL = $("#TrecServiceURL").val();
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.withCredentials = true;
        xmlhttp.open('POST', trecServiceURL, true);

        var processRosterURL = $("#ProcessRosterURL").val();
        var devToken = $("#devToken").val();

        // build SOAP request
        var str = $("#requestXML").val();
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/ /g, '');


        var sr = '<?xml version="1.0" encoding="UTF-8"?>' +
                 '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                 '<soapenv:Header>' +
                 '<ValidationSoapHeader xmlns="' + processRosterURL + '">' +
                 '<DevToken>' + devToken + '</DevToken>' +
                 '</ValidationSoapHeader>' +
                 '</soapenv:Header>' +
                 '<soapenv:Body>' +
                 '<ProcessRoster xmlns="' + processRosterURL + '">' +
                 '<xmlReq>&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;Transmission xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"&gt;' +
                  str +
                 '&lt;/Transmission&gt;</xmlReq></ProcessRoster></soapenv:Body></soapenv:Envelope>';

        var cnt = 0;
        xmlhttp.onreadystatechange = function () {

            if (xmlhttp.readyState == 4) {

                if (xmlhttp.status == 200) {
                    xmlDoc = xmlhttp.responseXML;

                    var result;
                    var dataToAppend = "<Table class='table-bordered table table-striped col-lg-12'><tr><th>Prov</th><th>CRSE</th><th>CDate</th><th>CStartDate</th><th>License #</th><th>Name</th><th>Response from TREC</th><th></th></tr>";
                    var $xml = $(xmlDoc);
                    var subSet = $xml.find('ProcessRosterResponse');
                    var $response = $(subSet.text());

                    $("#responseTable").removeClass('hidden');
                    $("#requestResultLabel").removeClass('hidden');

                    if ($response.find('Record').length === 0) {
                        fnSetErrorLabels();
                    }
                    else{
                        $response.find('Record').each(function () {
                            dataToAppend = dataToAppend + "<tr><td>";
                            cnt++;
                            $(this).children().each(function () {
                                if (! $(this).is('InstructorDetailData')) {
                                    dataToAppend = dataToAppend + $(this).text() + "</td><td>";
                                    $("#responseTable").html(dataToAppend);
                                }
                            });
                            dataToAppend = dataToAppend + "</td></tr>";
                        });

                        $("#responseTable").html(dataToAppend + "</table>");
                        $("#cntLabel").html("Processed " + cnt + " records");
                    }
                }
                else {
                    fnSetErrorLabels();
                }
            }
            else {
                fnSetErrorLabels();
            }
        };

        // Send the POST request
        xmlhttp.setRequestHeader('Content-Type', 'text/xml');
        xmlhttp.send(sr);
        // send request

        function fnSetErrorLabels()
        {
            $("#cntLabel").html("Processed " + 0 + " records");
            $("#responseTable").html("<span class='alert-danger'>An error returned from the server. Check to make sure your XML is properly formatted.</span>");
        }
    }
});
