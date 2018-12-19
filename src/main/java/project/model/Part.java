package project.model;

import javax.persistence.*;

@Entity
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String component;

    private int quantity;

    private boolean isNecessary;


    public Part() {
    }

    public Part(String component, int quantity, boolean isNecessary) {
        this.component = component;
        this.quantity = quantity;
        this.isNecessary = isNecessary;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getComponent() {
        return component;
    }

    public void setComponent(String component) {
        this.component = component;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public boolean isNecessary() {
        return isNecessary;
    }

    public void setNecessary(boolean necessary) {
        isNecessary = necessary;
    }

    @Override
    public String toString() {
        return "Part{" +
                "id=" + id +
                ", component='" + component + '\'' +
                ", quantity=" + quantity +
                ", isNecessary=" + isNecessary +
                '}';
    }
}
