function ipToSubnetting(ip)
{
    let valido = true;
    ip = ip.split('/');
    if (ip.length === 2)
    {
        let dir = ip[0].split('.');
        let mascara = ip[1];

        if (dir.length === 4)
        {
            for (let i = 0; i < 4; i++)
            {
                if (isNaN(parseInt(dir[i]))) valido = false;
            }
            if (isNaN(parseInt(mascara))) valido = false;

            if (valido)
            {
                for (let i = 0; i < 4; i++)
                {
                    dir[i] = parseInt(dir[i]);
                    if (dir[i] < 0 || dir[i] > 255) valido = false;
                }
                mascara = parseInt(mascara);
                if (mascara < 0 || mascara > 32) valido = false;

                if (valido)
                {
                    // A partir de aquí ya sabemos que la IP es totalmente válida
                    document.getElementById("ipCorrecta").innerText = "O";
                    document.getElementById("ipCorrecta").style.color = "lime";
                    return;
                }
            }
        }
    }
    document.getElementById("ipCorrecta").innerText = "X";
    document.getElementById("ipCorrecta").style.color = "red";

    if (!((ip[0][ip[0].length - 1] <= '9' && ip[0][ip[0].length - 1] >= '0') || (ip[0][ip[0].length - 1] === '.' && ip[0][ip[0].length - 2] !== '.')))
    {
        document.getElementById("inpDir").value = ip[0].substring(0, ip[0].length - 1);
    }
}

function checkHosts(hosts)
{
    if (!((hosts[hosts.length - 1] <= '9' && hosts[hosts.length - 1] >= '0') || (hosts[hosts.length - 1] === ',' && hosts[hosts.length - 2] !== ',')))
    {
        document.getElementById("inpHosts").value = hosts.substring(0, hosts.length - 1);
    }
    else
    {
        document.getElementById("hostsCorrectos").innerText = "O";
        document.getElementById("hostsCorrectos").style.color = "lime";

        if (hosts[hosts.length - 1] === ',')
        {
            document.getElementById("hostsCorrectos").innerText = "X";
            document.getElementById("hostsCorrectos").style.color = "red";
        }
    }
}

function calcularOnClick()
{
    let ipOk = document.getElementById("ipCorrecta").textContent === 'O';
    let hostsOk = document.getElementById("hostsCorrectos").textContent === 'O';
    if (ipOk && hostsOk)
    {
        console.log("Todo correcto");
    }
    else console.log("Error");
}
