package project.view;

import io.swagger.annotations.ApiModelProperty;

public class PartView {
    @ApiModelProperty(hidden = true)
    public long id;

    public String component;

    public int quantity;

    public boolean isNecessary;

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
        return "PartView{" +
                "id=" + id +
                ", component='" + component + '\'' +
                ", quantity=" + quantity +
                ", isNecessary=" + isNecessary +
                '}';
    }
}