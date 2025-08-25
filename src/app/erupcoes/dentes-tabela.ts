export interface Dente {
    Dente: string;  // Número do dente
    Nome: string;   // Nome do dente
    De: number;     // Início da faixa de erupção em meses
    Ate: number;    // Fim da faixa de erupção em meses
    Erupcao: number; // Média de erupção em meses
}

export const dentesTabela: Dente[] = [
  { Dente: "51", Nome: "Incisivo Central Superior Decíduo Direito", De: 8, Ate: 12, Erupcao: 10 },
  { Dente: "52", Nome: "Incisivo Lateral Superior Decíduo Direito", De: 9, Ate: 13, Erupcao: 11 },
  { Dente: "53", Nome: "Canino Superior Decíduo Direito", De: 16, Ate: 22, Erupcao: 19 },
  { Dente: "54", Nome: "Primeiro Molar Superior Decíduo Direito", De: 13, Ate: 19, Erupcao: 16 },
  { Dente: "55", Nome: "Segundo Molar Superior Decíduo Direito", De: 25, Ate: 33, Erupcao: 29 },

  { Dente: "61", Nome: "Incisivo Central Superior Decíduo Esquerdo", De: 8, Ate: 12, Erupcao: 10 },
  { Dente: "62", Nome: "Incisivo Lateral Superior Decíduo Esquerdo", De: 9, Ate: 13, Erupcao: 11 },
  { Dente: "63", Nome: "Canino Superior Decíduo Esquerdo", De: 16, Ate: 22, Erupcao: 19 },
  { Dente: "64", Nome: "Primeiro Molar Superior Decíduo Esquerdo", De: 13, Ate: 19, Erupcao: 16 },
  { Dente: "65", Nome: "Segundo Molar Superior Decíduo Esquerdo", De: 25, Ate: 33, Erupcao: 29 },

  { Dente: "71", Nome: "Incisivo Central Inferior Decíduo Esquerdo", De: 6, Ate: 10, Erupcao: 8 },
  { Dente: "72", Nome: "Incisivo Lateral Inferior Decíduo Esquerdo", De: 7, Ate: 16, Erupcao: 13 },
  { Dente: "73", Nome: "Canino Inferior Decíduo Esquerdo", De: 16, Ate: 22, Erupcao: 20 },
  { Dente: "74", Nome: "Primeiro Molar Inferior Decíduo Esquerdo", De: 12, Ate: 18, Erupcao: 16 },
  { Dente: "75", Nome: "Segundo Molar Inferior Decíduo Esquerdo", De: 20, Ate: 31, Erupcao: 27 },

  { Dente: "81", Nome: "Incisivo Central Inferior Decíduo Direito", De: 6, Ate: 10, Erupcao: 8 },
  { Dente: "82", Nome: "Incisivo Lateral Inferior Decíduo Direito", De: 7, Ate: 16, Erupcao: 13 },
  { Dente: "83", Nome: "Canino Inferior Decíduo Direito", De: 16, Ate: 22, Erupcao: 20 },
  { Dente: "84", Nome: "Primeiro Molar Inferior Decíduo Direito", De: 12, Ate: 18, Erupcao: 16 },
  { Dente: "85", Nome: "Segundo Molar Inferior Decíduo Direito", De: 20, Ate: 31, Erupcao: 27 },

  { Dente: "11", Nome: "Incisivo Central Superior Permanente Direito", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "12", Nome: "Incisivo Lateral Superior Permanente Direito", De: 84, Ate: 96, Erupcao: 90 },
  { Dente: "13", Nome: "Canino Superior Permanente Direito", De: 108, Ate: 144, Erupcao: 120 },
  { Dente: "14", Nome: "Primeiro Pré-molar Superior Permanente Direito", De: 108, Ate: 132, Erupcao: 114 },
  { Dente: "15", Nome: "Segundo Pré-molar Superior Permanente Direito", De: 120, Ate: 144, Erupcao: 132 },
  { Dente: "16", Nome: "Primeiro Molar Superior Permanente Direito", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "17", Nome: "Segundo Molar Superior Permanente Direito", De: 144, Ate: 168, Erupcao: 156 },
  { Dente: "18", Nome: "Terceiro Molar Superior Permanente Direito", De: 216, Ate: 264, Erupcao: 240 },

  { Dente: "21", Nome: "Incisivo Central Superior Permanente Esquerdo", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "22", Nome: "Incisivo Lateral Superior Permanente Esquerdo", De: 84, Ate: 96, Erupcao: 90 },
  { Dente: "23", Nome: "Canino Superior Permanente Esquerdo", De: 108, Ate: 144, Erupcao: 120 },
  { Dente: "24", Nome: "Primeiro Pré-molar Superior Permanente Esquerdo", De: 108, Ate: 132, Erupcao: 114 },
  { Dente: "25", Nome: "Segundo Pré-molar Superior Permanente Esquerdo", De: 120, Ate: 144, Erupcao: 132 },
  { Dente: "26", Nome: "Primeiro Molar Superior Permanente Esquerdo", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "27", Nome: "Segundo Molar Superior Permanente Esquerdo", De: 144, Ate: 168, Erupcao: 156 },
  { Dente: "28", Nome: "Terceiro Molar Superior Permanente Esquerdo", De: 216, Ate: 264, Erupcao: 240 },

  { Dente: "31", Nome: "Incisivo Central Inferior Permanente Esquerdo", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "32", Nome: "Incisivo Lateral Inferior Permanente Esquerdo", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "33", Nome: "Canino Inferior Permanente Esquerdo", De: 108, Ate: 132, Erupcao: 120 },
  { Dente: "34", Nome: "Primeiro Pré-molar Inferior Permanente Esquerdo", De: 108, Ate: 132, Erupcao: 120 },
  { Dente: "35", Nome: "Segundo Pré-molar Inferior Permanente Esquerdo", De: 120, Ate: 144, Erupcao: 132 },
  { Dente: "36", Nome: "Primeiro Molar Inferior Permanente Esquerdo", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "37", Nome: "Segundo Molar Inferior Permanente Esquerdo", De: 144, Ate: 168, Erupcao: 156 },
  { Dente: "38", Nome: "Terceiro Molar Inferior Permanente Esquerdo", De: 216, Ate: 264, Erupcao: 240 },

  { Dente: "41", Nome: "Incisivo Central Inferior Permanente Direito", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "42", Nome: "Incisivo Lateral Inferior Permanente Direito", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "43", Nome: "Canino Inferior Permanente Direito", De: 108, Ate: 132, Erupcao: 120 },
  { Dente: "44", Nome: "Primeiro Pré-molar Inferior Permanente Direito", De: 108, Ate: 132, Erupcao: 120 },
  { Dente: "45", Nome: "Segundo Pré-molar Inferior Permanente Direito", De: 120, Ate: 144, Erupcao: 132 },
  { Dente: "46", Nome: "Primeiro Molar Inferior Permanente Direito", De: 72, Ate: 84, Erupcao: 78 },
  { Dente: "47", Nome: "Segundo Molar Inferior Permanente Direito", De: 144, Ate: 168, Erupcao: 156 },
  { Dente: "48", Nome: "Terceiro Molar Inferior Permanente Direito", De: 216, Ate: 264, Erupcao: 240 }
];

export const dentesTabelaHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #2A7AC3;
    }
    h3 {
      text-align: center;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h3>Tabela de Referência de Erupções Dentárias</h3>
  <table>
    <thead>
      <tr>
        <th>Dente</th>
        <th>Nome</th>
        <th>De (meses)</th>
        <th>Até (meses)</th>
        <th>Erupção (meses)</th>
      </tr>
    </thead>
    <tbody>
      <!-- Dentes Decíduos -->
      <tr>
        <td>51</td>
        <td>Incisivo Central Superior Decíduo Direito</td>
        <td>8</td>
        <td>12</td>
        <td>10</td>
      </tr>
      <tr>
        <td>52</td>
        <td>Incisivo Lateral Superior Decíduo Direito</td>
        <td>9</td>
        <td>13</td>
        <td>11</td>
      </tr>
      <tr>
        <td>53</td>
        <td>Canino Superior Decíduo Direito</td>
        <td>16</td>
        <td>22</td>
        <td>19</td>
      </tr>
      <tr>
        <td>54</td>
        <td>Primeiro Molar Superior Decíduo Direito</td>
        <td>13</td>
        <td>19</td>
        <td>16</td>
      </tr>
      <tr>
        <td>55</td>
        <td>Segundo Molar Superior Decíduo Direito</td>
        <td>25</td>
        <td>33</td>
        <td>29</td>
      </tr>
      <tr>
        <td>61</td>
        <td>Incisivo Central Superior Decíduo Esquerdo</td>
        <td>8</td>
        <td>12</td>
        <td>10</td>
      </tr>
      <tr>
        <td>62</td>
        <td>Incisivo Lateral Superior Decíduo Esquerdo</td>
        <td>9</td>
        <td>13</td>
        <td>11</td>
      </tr>
      <tr>
        <td>63</td>
        <td>Canino Superior Decíduo Esquerdo</td>
        <td>16</td>
        <td>22</td>
        <td>19</td>
      </tr>
      <tr>
        <td>64</td>
        <td>Primeiro Molar Superior Decíduo Esquerdo</td>
        <td>13</td>
        <td>19</td>
        <td>16</td>
      </tr>
      <tr>
        <td>65</td>
        <td>Segundo Molar Superior Decíduo Esquerdo</td>
        <td>25</td>
        <td>33</td>
        <td>29</td>
      </tr>
      <tr>
        <td>71</td>
        <td>Incisivo Central Inferior Decíduo Esquerdo</td>
        <td>6</td>
        <td>10</td>
        <td>8</td>
      </tr>
      <tr>
        <td>72</td>
        <td>Incisivo Lateral Inferior Decíduo Esquerdo</td>
        <td>7</td>
        <td>16</td>
        <td>13</td>
      </tr>
      <tr>
        <td>73</td>
        <td>Canino Inferior Decíduo Esquerdo</td>
        <td>16</td>
        <td>22</td>
        <td>20</td>
      </tr>
      <tr>
        <td>74</td>
        <td>Primeiro Molar Inferior Decíduo Esquerdo</td>
        <td>12</td>
        <td>18</td>
        <td>16</td>
      </tr>
      <tr>
        <td>75</td>
        <td>Segundo Molar Inferior Decíduo Esquerdo</td>
        <td>20</td>
        <td>31</td>
        <td>27</td>
      </tr>
      <tr>
        <td>81</td>
        <td>Incisivo Central Inferior Decíduo Direito</td>
        <td>6</td>
        <td>10</td>
        <td>8</td>
      </tr>
      <tr>
        <td>82</td>
        <td>Incisivo Lateral Inferior Decíduo Direito</td>
        <td>7</td>
        <td>16</td>
        <td>13</td>
      </tr>
      <tr>
        <td>83</td>
        <td>Canino Inferior Decíduo Direito</td>
        <td>16</td>
        <td>22</td>
        <td>20</td>
      </tr>
      <tr>
        <td>84</td>
        <td>Primeiro Molar Inferior Decíduo Direito</td>
        <td>12</td>
        <td>18</td>
        <td>16</td>
      </tr>
      <tr>
        <td>85</td>
        <td>Segundo Molar Inferior Decíduo Direito</td>
        <td>20</td>
        <td>31</td>
        <td>27</td>
      </tr>

      <!-- Dentes Permanentes -->
      <tr>
        <td>11</td>
        <td>Incisivo Central Superior Permanente Direito</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>12</td>
        <td>Incisivo Lateral Superior Permanente Direito</td>
        <td>84</td>
        <td>96</td>
        <td>90</td>
      </tr>
      <tr>
        <td>13</td>
        <td>Canino Superior Permanente Direito</td>
        <td>108</td>
        <td>144</td>
        <td>120</td>
      </tr>
      <tr>
        <td>14</td>
        <td>Primeiro Pré-molar Superior Permanente Direito</td>
        <td>108</td>
        <td>132</td>
        <td>114</td>
      </tr>
      <tr>
        <td>15</td>
        <td>Segundo Pré-molar Superior Permanente Direito</td>
        <td>120</td>
        <td>144</td>
        <td>132</td>
      </tr>
      <tr>
        <td>16</td>
        <td>Primeiro Molar Superior Permanente Direito</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>17</td>
        <td>Segundo Molar Superior Permanente Direito</td>
        <td>144</td>
        <td>168</td>
        <td>156</td>
      </tr>
      <tr>
        <td>18</td>
        <td>Terceiro Molar Superior Permanente Direito</td>
        <td>216</td>
        <td>264</td>
        <td>240</td>
      </tr>
      <tr>
        <td>21</td>
        <td>Incisivo Central Superior Permanente Esquerdo</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>22</td>
        <td>Incisivo Lateral Superior Permanente Esquerdo</td>
        <td>84</td>
        <td>96</td>
        <td>90</td>
      </tr>
      <tr>
        <td>23</td>
        <td>Canino Superior Permanente Esquerdo</td>
        <td>108</td>
        <td>144</td>
        <td>120</td>
      </tr>
      <tr>
        <td>24</td>
        <td>Primeiro Pré-molar Superior Permanente Esquerdo</td>
        <td>108</td>
        <td>132</td>
        <td>114</td>
      </tr>
      <tr>
        <td>25</td>
        <td>Segundo Pré-molar Superior Permanente Esquerdo</td>
        <td>120</td>
        <td>144</td>
        <td>132</td>
      </tr>
      <tr>
        <td>26</td>
        <td>Primeiro Molar Superior Permanente Esquerdo</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>27</td>
        <td>Segundo Molar Superior Permanente Esquerdo</td>
        <td>144</td>
        <td>168</td>
        <td>156</td>
      </tr>
      <tr>
        <td>28</td>
        <td>Terceiro Molar Superior Permanente Esquerdo</td>
        <td>216</td>
        <td>264</td>
        <td>240</td>
      </tr>
      <tr>
        <td>31</td>
        <td>Incisivo Central Inferior Permanente Esquerdo</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>32</td>
        <td>Incisivo Lateral Inferior Permanente Esquerdo</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>33</td>
        <td>Canino Inferior Permanente Esquerdo</td>
        <td>108</td>
        <td>132</td>
        <td>120</td>
      </tr>
      <tr>
        <td>34</td>
        <td>Primeiro Pré-molar Inferior Permanente Esquerdo</td>
        <td>108</td>
        <td>132</td>
        <td>120</td>
      </tr>
      <tr>
        <td>35</td>
        <td>Segundo Pré-molar Inferior Permanente Esquerdo</td>
        <td>120</td>
        <td>144</td>
        <td>132</td>
      </tr>
      <tr>
        <td>36</td>
        <td>Primeiro Molar Inferior Permanente Esquerdo</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>37</td>
        <td>Segundo Molar Inferior Permanente Esquerdo</td>
        <td>144</td>
        <td>168</td>
        <td>156</td>
      </tr>
      <tr>
        <td>38</td>
        <td>Terceiro Molar Inferior Permanente Esquerdo</td>
        <td>216</td>
        <td>264</td>
        <td>240</td>
      </tr>
      <tr>
        <td>41</td>
        <td>Incisivo Central Inferior Permanente Direito</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>42</td>
        <td>Incisivo Lateral Inferior Permanente Direito</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>43</td>
        <td>Canino Inferior Permanente Direito</td>
        <td>108</td>
        <td>132</td>
        <td>120</td>
      </tr>
      <tr>
        <td>44</td>
        <td>Primeiro Pré-molar Inferior Permanente Direito</td>
        <td>108</td>
        <td>132</td>
        <td>120</td>
      </tr>
      <tr>
        <td>45</td>
        <td>Segundo Pré-molar Inferior Permanente Direito</td>
        <td>120</td>
        <td>144</td>
        <td>132</td>
      </tr>
      <tr>
        <td>46</td>
        <td>Primeiro Molar Inferior Permanente Direito</td>
        <td>72</td>
        <td>84</td>
        <td>78</td>
      </tr>
      <tr>
        <td>47</td>
        <td>Segundo Molar Inferior Permanente Direito</td>
        <td>144</td>
        <td>168</td>
        <td>156</td>
      </tr>
      <tr>
        <td>48</td>
        <td>Terceiro Molar Inferior Permanente Direito</td>
        <td>216</td>
        <td>264</td>
        <td>240</td>
      </tr>
    </tbody>
  </table>
</body>
</html>

`;