/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
let masksIP =   ["0.0.0.0", "128.0.0.0", "192.0.0.0", "224.0.0.0", "240.0.0.0", "248.0.0.0", "252.0.0.0", "254.0.0.0", "255.0.0.0", "255.128.0.0", "255.192.0.0",
                "255.224.0.0", "255.240.0.0", "255.248.0.0", "255.252.0.0", "255.254.0.0", "255.255.0.0", "255.255.128.0", "255.255.192.0", "255.255.224.0", "255.255.240.0", "255.255.248.0",
                "255.255.252.0", "255.255.254.0", "255.255.255.0", "255.255.255.128", "255.255.255.192", "255.255.255.224", "255.255.255.240", "255.255.255.248", "255.255.255.252", "255.255.255.254", "255.255.255.255"];

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

/**
 * Suma el valor n a la IPv4. Ejemplo: 192.168.255.254 + 3 = 192.169.0.1
 * @param ip es la IPv4
 * @param n es la unidad que se quiere sumar en la IP
 */
function sumarIP(ip, n)
{
    ip[3] += n;
    while (ip[3] > 255)
    {
        ip[3] -= 256;
        ip[2]++;
        if (ip[2] > 255)
        {
            ip[2] -= 256;
            ip[1]++;
            if (ip[1] > 255)
            {
                ip[1] -= 256;
                ip[0]++;
            }
        }
    }
    return ip;
}

function calcularOnClick()
{
    let ipOk = document.getElementById("ipCorrecta").textContent === 'O';
    let hostsOk = document.getElementById("hostsCorrectos").textContent === 'O';

    if (ipOk && hostsOk)
    {
        let subn = document.getElementById("textoSubn");

        let subnet = "";
        let ip = document.getElementById("inpDir").value.split('/')[0].split('.');
        for (let i = 0; i < ip.length; i++) ip[i] = parseInt(ip[i]); // Conversión a enteros en la IP
        let mascara = document.getElementById("inpDir").value.split('/')[1];
        let hosts = document.getElementById("inpHosts").value.split(',');
        for (let i = 0; i < hosts.length; i++) hosts[i] = parseInt(hosts[i]); // Conversión a enteros en los hosts
        for (let i = 0; i < hosts.length; i++) // Algoritmo de la burbuja para reordenamiento decreciente de los hosts
        {
            for (let j = i + 1; j < hosts.length; j++)
            {
                if (hosts[j] > hosts[i])
                {
                    let aux = hosts[i];
                    hosts[i] = hosts[j];
                    hosts[j] = aux;
                }
            }
        }
        console.log(hosts);

        for (let i = 0; i < hosts.length; i++)
        {
            subnet += hosts[i] + " hosts - Máscara /";

            let nMask = -1; // Máscara de la subred
            let j = 0;
            while (j <= 32 && nMask === -1) // Se recorren todas las máscaras existentes para ver si entran los hosts
            {
                if (Math.pow(2, j) - hosts[i] >= 0) // Si la cantidad máxima de hosts es suficiente para los hosts deseados...
                {
                    nMask = 32 - j;
                }
                j++;
            }
            if (nMask === -1) return;

            subnet += nMask + " -> " + masksIP[nMask] + " (máx. " + Math.pow(2, 32 - nMask) + " hosts)";
            subnet += "\nRed: " + ip.join('.');

            ip = sumarIP(ip, 1);
            subnet += "\nPrimera IP: " + ip.join('.');

            ip = sumarIP(ip, Math.pow(2, 32 - nMask) - 3);
            subnet += "\nÚltima IP: " + ip.join('.');

            ip = sumarIP(ip, 1);
            subnet += "\nBroadcast: " + ip.join('.') + "\n\n";

            ip = sumarIP(ip, 1); // Sumamos una unidad para la próxima red
        }

        subn.innerText = subnet;
    }
    else console.log("Error");
}

function autoIP()
{
    document.getElementById("inpDir").value = "192.168.100.0/24";
    document.getElementById("ipCorrecta").innerText = "O";
    document.getElementById("ipCorrecta").style.color = "lime";
}

function autoHosts()
{
    document.getElementById("inpHosts").value = "5,13,7,28,35,4";
    document.getElementById("hostsCorrectos").innerText = "O";
    document.getElementById("hostsCorrectos").style.color = "lime";
}