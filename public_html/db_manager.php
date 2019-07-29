<?php
/**
 * DbManager Class Doc Comment
 * Gestionnaire de connexion de base de données
 * 
 * @category Class
 * @package  Memory
 * @author   Olivier Dalmas <olivier.dalmas@protonmail.com>
 * @licence  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://localhost/
 */
class DbManager
{
    // variables
    private $_host = 'mysql';
    private $_user = 'root';
    private $_pass = 'rootpassword';
    private $_db_name = 'memory';
    private $_conn;
    private $_query;
    private $_duration;

    /**
     * Build connexion.
     */
    public function __construct()
    {
        // connexion à la base de données
        $this->_conn = new mysqli($this->_host, $this->_user, $this->_pass, $this->_db_name);

        if ($this->_conn->connect_error) {
            die("Connection failed: " . $this->$_conn->connect_error);
        }
    }

    /**
     * Sets the query.
     *
     * @query Query string
     *
     * @return self
     */
    public function setQuery($query)
    {
        // assignation de la requête
        $this->_query = $query;

        return $this;
    }

    /**
     * Sets the game duration.
     *
     * @duration Game duration
     *
     * @return self
     */
    public function setDuration($duration)
    {
        // assignation de la durée
        $this->_duration = $duration;

        return $this;
    }

    /**
     * Data Binding and insertion
     */
    public function executeInsert()
    {
        $stmt = $this->_conn->prepare($this->_query);

        // prevents sql injections
        $stmt->bind_param('d', $this->_duration);

        $stmt->execute();
    }

    /**
     * Execute select query
     * 
     * @return array
     */
    public function executeSelect()
    {
        $stmt = $this->_conn->query($this->_query);

        return $stmt->fetch_all();
    }    
}
